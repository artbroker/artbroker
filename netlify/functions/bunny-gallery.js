const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);

const ALLOWED_FOLDERS = new Set([
  'HermanBrood',
  'HansJochemBakker',
  'Corneille',
  'KarelAppel',
  'Banksy',
  'Picasso',
  'AndyWarhol',
  'Dali',
  'krantenartikelen'
]);

function naturalSort(a, b) {
  return a.localeCompare(b, 'nl', { numeric: true, sensitivity: 'base' });
}

function publicUrlFor(pullzoneUrl, folder, fileName) {
  const cleanPullzone = pullzoneUrl.replace(/\/+$/, '');
  const cleanFolder = folder.split('/').map(encodeURIComponent).join('/');
  const cleanFile = encodeURIComponent(fileName);
  return `${cleanPullzone}/${cleanFolder}/${cleanFile}`;
}

exports.handler = async (event) => {
  try {
    const folder = event.queryStringParameters?.folder;

    if (!folder || !ALLOWED_FOLDERS.has(folder)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unknown or missing folder.' })
      };
    }

    const storageZone = process.env.BUNNY_STORAGE_ZONE;
    const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY;
    const endpoint = (process.env.BUNNY_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com').replace(/\/+$/, '');
    const pullzoneUrl = process.env.BUNNY_PULLZONE_URL;

    if (!storageZone || !accessKey || !pullzoneUrl) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Bunny environment variables are missing.' })
      };
    }

    const storageUrl = `${endpoint}/${encodeURIComponent(storageZone)}/${encodeURIComponent(folder)}/`;
    const response = await fetch(storageUrl, {
      method: 'GET',
      headers: {
        AccessKey: accessKey,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Bunny API request failed.', details: text.slice(0, 500) })
      };
    }

    const files = await response.json();
    const images = files
      .filter((item) => !item.IsDirectory && item.ObjectName)
      .filter((item) => {
        const ext = item.ObjectName.split('.').pop()?.toLowerCase();
        return IMAGE_EXTENSIONS.has(ext);
      })
      .sort((a, b) => naturalSort(a.ObjectName, b.ObjectName))
      .map((item) => {
        const nameWithoutExt = item.ObjectName.replace(/\.[^.]+$/, '');
        const title = nameWithoutExt
          .replace(/^imgi_\d+_/, '')
          .replace(/[-_]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          name: item.ObjectName,
          title,
          url: publicUrlFor(pullzoneUrl, folder, item.ObjectName),
          size: item.Length || item.Size || null,
          lastChanged: item.LastChanged || null
        };
      });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify(images)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Unexpected error.' })
    };
  }
};
