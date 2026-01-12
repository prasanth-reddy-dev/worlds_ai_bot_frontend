
export async function initPyodide() {
    // Load Pyodide from CDN
    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
    });
  
    // Load commonly used packages
    await pyodide.loadPackage(["numpy", "pandas"]);
    
    return pyodide;
  }