const API_BASE_URL = '/api/v1';

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

export async function fetchAnalyses(page = 1, limit = 10, qualityLabel = '', search = '') {
  const params = new URLSearchParams({
    page,
    limit,
  });
  if (qualityLabel) params.append('quality_label', qualityLabel);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE_URL}/analyses?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchAnalysisById(id) {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analysis details: ${response.statusText}`);
  }
  return response.json();
}

export async function deleteAnalysis(id) {
  const response = await fetch(`${API_BASE_URL}/analyses/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete analysis: ${response.statusText}`);
  }
  return true;
}

export async function fetchHealthStatus() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed`);
  }
  return response.json();
}

export async function fetchModelInfo() {
  const response = await fetch(`${API_BASE_URL}/model-info`);
  if (!response.ok) {
    throw new Error(`Failed to fetch model info`);
  }
  return response.json();
}
