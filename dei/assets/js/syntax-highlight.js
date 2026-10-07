(() => {
  const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
  const token = (kind, value) => `<span class="tok-${kind}">${esc(value)}</span>`;
  const keywords = new Set(['using','namespace','public','private','protected','internal','class','struct','interface','enum','void','return','if','else','for','foreach','while','in','new','null','true','false','static','readonly','ref','override','partial','var','this']);
  const types = new Set(['bool','int','float','string','Vector3','GameObject','Light','AudioSource','AudioClip','Renderer','Material','Collider','MonoBehaviour','Pose','Entity','IComponentData','ISystem','SystemState','LocalTransform','NativeArray','IJobParallelFor','ARRaycastManager','ARRaycastHit','UnityEvent','EntityCommandBuffer','TransformUsageFlags','Touch','TouchPhase','float3']);

  function csharp(source) {
    let html = '', index = 0;
    while (index < source.length) {
      const rest = source.slice(index);
      let match;
      if (rest.startsWith('//')) {
        const end = rest.indexOf('\n');
        const value = end === -1 ? rest : rest.slice(0, end);
        html += token('comment', value); index += value.length; continue;
      }
      if (rest.startsWith('/*')) {
        const end = rest.indexOf('*/', 2);
        const value = end === -1 ? rest : rest.slice(0, end + 2);
        html += token('comment', value); index += value.length; continue;
      }
      if (rest[0] === '"') {
        let end = 1;
        while (end < rest.length) { if (rest[end] === '"' && rest[end - 1] !== '\\') { end++; break; } end++; }
        html += token('string', rest.slice(0, end)); index += end; continue;
      }
      if ((match = rest.match(/^\b\d+(?:\.\d+)?f?\b/))) {
        html += token('number', match[0]); index += match[0].length; continue;
      }
      if ((match = rest.match(/^\b[A-Za-z_]\w*\b/))) {
        const word = match[0], after = rest.slice(word.length);
        if (keywords.has(word)) html += token('keyword', word);
        else if (types.has(word) || /^[A-Z][A-Za-z0-9_]*$/.test(word)) html += token('type', word);
        else if (/^\s*\(/.test(after)) html += token('function', word);
        else html += esc(word);
        index += word.length; continue;
      }
      html += '[](){}'.includes(rest[0]) ? token('punctuation', rest[0]) : esc(rest[0]);
      index++;
    }
    return html;
  }

  function plain(source, title) {
    return source.split('\n').map(line => {
      if (/^\s*#/.test(line) || /^\s*<!--/.test(line)) return token('comment', line);
      if (/^\s*(git|cd)\b/.test(line)) {
        const command = line.match(/^\s*(git|cd)\b/)[1];
        return esc(line).replace(command, token('keyword', command));
      }
      if (/^#{1,6}\s/.test(line)) return token('keyword', line);
      if (/Estructura|Jerarquía|Prefijos/.test(title) || /[├└│─]/.test(line)) {
        return esc(line).replace(/^([A-Za-z_][A-Za-z0-9_ ]*)/, '<span class="tok-type">$1</span>');
      }
      return esc(line).replace(/\b(Assets|Scenes|Scripts|Prefabs|Materials|Models|Textures|Audio|Documentation)\b/g, '<span class="tok-type">$1</span>').replace(/\b\d+(?:\.\d+)?\b/g, '<span class="tok-number">$&</span>');
    }).join('\n');
  }

  document.querySelectorAll('.code-block').forEach(block => {
    const code = block.querySelector('pre code');
    if (!code || code.dataset.highlighted) return;
    const title = block.querySelector('.code-title')?.textContent || '';
    const source = code.textContent;
    const isCSharp = /\.cs\b|IComponentData|Authoring|ISystem|IJobParallelFor/.test(title) || /\busing Unity(?:Engine|Entities|Burst|Jobs|Mathematics)/.test(source);
    code.innerHTML = isCSharp ? csharp(source) : plain(source, title);
    code.dataset.highlighted = 'true';
  });
})();
