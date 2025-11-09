const express = require('express');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware do parsowania JSON
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gemini-cli-wrapper' });
});

// Główny endpoint do wywoływania Gemini CLI
app.post('/query', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;

    // Walidacja
    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        message: 'Please provide a prompt in the request body'
      });
    }

    // Budowanie komendy
    let command = `gemini -p "${prompt.replace(/"/g, '\\"')}" --output-format json`;

    // Dodatkowe opcje jeśli są podane
    if (options.temperature) {
      command += ` --temperature ${options.temperature}`;
    }
    if (options.maxTokens) {
      command += ` --max-tokens ${options.maxTokens}`;
    }
    if (options.model) {
      command += ` --model ${options.model}`;
    }

    console.log(`Executing: ${command}`);

    // Wykonanie komendy z timeoutem (60 sekund)
    const { stdout, stderr } = await execPromise(command, {
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    if (stderr) {
      console.error('Stderr:', stderr);
    }

    // Parsowanie JSON response
    let result;
    try {
      result = JSON.parse(stdout);
    } catch (parseError) {
      // Jeśli nie udało się sparsować jako JSON, zwróć raw output
      result = { raw_output: stdout };
    }

    res.json({
      success: true,
      data: result,
      metadata: {
        prompt: prompt,
        options: options,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error executing Gemini CLI:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stderr || error.stdout || null
    });
  }
});

// Endpoint do batch queries
app.post('/batch', async (req, res) => {
  try {
    const { prompts } = req.body;

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        error: 'Prompts array is required',
        message: 'Please provide an array of prompts'
      });
    }

    const results = [];

    for (const promptData of prompts) {
      const { prompt, options = {} } = typeof promptData === 'string'
        ? { prompt: promptData }
        : promptData;

      try {
        let command = `gemini -p "${prompt.replace(/"/g, '\\"')}" --output-format json`;

        if (options.temperature) command += ` --temperature ${options.temperature}`;
        if (options.maxTokens) command += ` --max-tokens ${options.maxTokens}`;
        if (options.model) command += ` --model ${options.model}`;

        const { stdout } = await execPromise(command, {
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024
        });

        let result;
        try {
          result = JSON.parse(stdout);
        } catch {
          result = { raw_output: stdout };
        }

        results.push({
          success: true,
          prompt: prompt,
          data: result
        });

      } catch (error) {
        results.push({
          success: false,
          prompt: prompt,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      total: prompts.length,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gemini CLI HTTP Wrapper listening on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Query endpoint: POST http://localhost:${PORT}/query`);
  console.log(`Batch endpoint: POST http://localhost:${PORT}/batch`);
});
