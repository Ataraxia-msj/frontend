export async function recommend(param, value) {
  const resp = await fetch('https://backend-c8xc.onrender.com/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input_param: param, input_value: value })
  });
  if (!resp.ok) throw new Error((await resp.json()).detail || '请求失败');
  return resp.json();
}
