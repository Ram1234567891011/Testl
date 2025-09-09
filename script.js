// script.js
let worker;

function ensureWorker() {
  if (!worker) {
    worker = new Worker('worker.js'); // classic worker, not module
    worker.onmessage = (e) => {
      const data = e.data;
      // The worker might send JSON strings or objects—handle both
      let msg = typeof data === 'string' ? data : (data && data.identifier ? data : null);

      // If cn.js finished initializing
      if (data && data.identifier === 'ready') {
        console.log('WASM ready');
        return;
      }

      // If we got a solved job
      if (typeof data === 'string' && data.startsWith('{') && data.includes('"solved"')) {
        const solved = JSON.parse(data);
        document.getElementById('result').textContent =
          `Solved! nonce=${solved.nonce} hash=${solved.result}`;
        return;
      }

      // Nothing found
      if (data === 'nothing') {
        document.getElementById('result').textContent = 'No valid hash this round.';
      }
    };
  }
  return worker;
}

// Example button handler you already reference in HTML
function searchWord() {
  // Your dictionary logic… (left as-is)
  // When you need to use the hashing worker, post a job like this:
  const w = ensureWorker();

  // Example job object shape expected by your worker:
  const job = {
    job_id: 'abc123',
    algo: 'cn',       // 'cn' | 'cn-lite' | 'cn-pico' | 'cn-half' | 'cn-rwz'
    variant: 0,       // from your backend/job spec
    height: 0,        // from your backend/job spec
    target: 'ffffffff', // hex target (example)
    blob: '...'       // the full blob string you get from your backend
  };

  const throttle = 0; // or any percentage 0–100

  w.postMessage({ job, throttle });
}
