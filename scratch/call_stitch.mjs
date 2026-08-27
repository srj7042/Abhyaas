const url = 'https://stitch.googleapis.com/mcp';
const key = 'AQ.Ab8RN6ItTB7lpqgERcVGOzqxyqy8uRhI6q1bu-QIA1pYD_PPKQA';

async function callStitch(methodName, args = {}) {
  console.log(`Calling tool: ${methodName} with args:`, args);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Goog-Api-Key': key
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: methodName,
          arguments: args
        },
        id: 1
      })
    });
    
    console.log(`HTTP Status: ${res.status}`);
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

// Default action: List projects
const toolName = process.argv[2] || 'list_projects';
const toolArgs = process.argv[3] ? JSON.parse(process.argv[3]) : {};

await callStitch(toolName, toolArgs);
