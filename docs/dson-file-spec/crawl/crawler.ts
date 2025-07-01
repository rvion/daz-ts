import { existsSync, mkdirSync } from 'fs';
import { load } from 'cheerio';
import path from 'path';

const BASE_URL = 'http://docs.daz3d.com';
const START_PATH = '/doku.php/public/dson_spec/object_definitions/start';
const OUTPUT_DIR = path.resolve(import.meta.dir);
const PAGES_DIR = path.join(OUTPUT_DIR, 'pages');

const FETCH_OPTIONS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  },
};

interface Property {
  name: string;
  description: string;
  default: string;
  required: string;
}

interface DsonObject {
  name: string;
  url: string;
  description: string;
  parentObjects: string[];
  extends: string[];
  properties: Property[];
  extendedBy: string[];
  details: string;
  example: string;
}

async function getObjectLinks(): Promise<{ name: string; url: string }[]> {
  console.log('Fetching main object definition page...');
  const response = await fetch(`${BASE_URL}${START_PATH}`, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Failed to fetch start page: ${response.statusText}`);
  }
  const html = await response.text();
  const $ = load(html);

  const links: { name: string; url: string }[] = [];
  $('.dokuwiki .page ul li a.wikilink1').each((_, el) => {
    const name = $(el).text();
    const url = $(el).attr('href');
    if (name && url) {
      links.push({ name, url });
    }
  });

  console.log(`Found ${links.length} object definition links.`);
  return links;
}

async function parseObjectPage(html: string, url: string): Promise<Partial<DsonObject>> {
  const $ = load(html);
  const $content = $('#dokuwiki__content');
  const name = $content.find('h1').first().text();
  console.log(`Parsing page for: ${name}`);

  const getSectionContent = (headerText: string, headerType: string = 'h2') => {
    return $content.find(`${headerType}:contains("${headerText}")`).next('div');
  };

  const description = getSectionContent('Description').html() || '';

  const getListItems = (headerText: string): string[] => {
    const items: string[] = [];
    getSectionContent(headerText).find('ul li a').each((_, el) => {
      items.push($(el).text());
    });
    return items;
  };

  const parentObjects = getListItems('Parent Objects');
  const extendsObjects = getListItems('Extends');
  const extendedBy = getListItems('Extended By');

  const properties: Property[] = [];
  getSectionContent('Properties').find('table.inline tbody tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 4) {
      properties.push({
        name: $(cells[0]).text().trim(),
        description: $(cells[1]).html() || '',
        default: $(cells[2]).text().trim(),
        required: $(cells[3]).text().trim(),
      });
    }
  });

  const details = getSectionContent('Details').html() || '';
  const example = getSectionContent('Example').find('pre.code').text().trim();

  return {
    name,
    url,
    description,
    parentObjects,
    extends: extendsObjects,
    properties,
    extendedBy,
    details,
    example,
  };
}

function generateMarkdown(schema: DsonObject[]): string {
  const objectNames = new Set(schema.map(o => o.name));

  const getAnchor = (objectName: string, sectionName?: string) => {
    let anchor = `dson-def-${objectName.toLowerCase().replace(/_/g, '-')}`;
    if (sectionName) {
      anchor += `-${sectionName.toLowerCase().replace(/ /g, '-')}`;
    }
    return anchor;
  };

  const createLink = (name: string) => {
    if (objectNames.has(name)) {
      return `[\`${name}\`](#${getAnchor(name)})`;
    }
    return `\`${name}\``;
  };

  const processHTMLContent = (html: string, currentObjectName: string) => {
    if (!html) return '';
    const $ = load(html);

    $('a').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const text = $el.text();
      let replacement = `\`${text}\``;

      if (href.includes('doku.php/public/dson_spec/object_definitions')) {
        const linkedObjectName = text;
        if (objectNames.has(linkedObjectName)) {
          const hash = href.split('#')[1];
          const anchor = getAnchor(linkedObjectName, hash);
          replacement = `[${text}](#${anchor})`;
        } else {
           replacement = `[${text}](${href})`;
        }
      } else if (href.startsWith('#')) {
        const sectionId = href.substring(1);
        replacement = `[${text}](#${getAnchor(currentObjectName, sectionId)})`;
      } else if (href.startsWith('http')) {
        replacement = `[${text}](${href})`;
      }
      $el.replaceWith(replacement);
    });

    return $.text();
  };

  let md = '# DSON File Format Schema\n\n';
  for (const obj of schema) {
    md += `<h2 id="${getAnchor(obj.name)}">${obj.name}</h2>\n\n`;
    if (obj.description) {
      md += `**Description:** ${processHTMLContent(obj.description, obj.name)}\n\n`;
    }

    const addSection = (title: string, content: string | string[], isList: boolean) => {
      if ((Array.isArray(content) && content.length > 0) || (typeof content === 'string' && content)) {
        md += `<h3 id="${getAnchor(obj.name, title)}">${title}</h3>\n\n`;
        if (isList && Array.isArray(content)) {
          content.forEach(item => (md += `- ${createLink(item)}\n`));
        } else if (!isList && typeof content === 'string') {
          md += `${processHTMLContent(content, obj.name)}\n\n`;
        }
        md += '\n';
      }
    };

    addSection('Appears within', obj.parentObjects, true);
    addSection('Extends', obj.extends, true);
    addSection('Extended By', obj.extendedBy, true);

    if (obj.properties.length) {
      md += `<h3 id="${getAnchor(obj.name, 'Properties')}">Properties</h3>\n\n`;
      md += '| Name | Description | Default | Required |\n';
      md += '|------|-------------|---------|----------|\n';
      obj.properties.forEach(p => {
        md += `| \`${p.name}\` | ${processHTMLContent(p.description, obj.name).replace(/\n/g, ' ')} | \`${p.default}\` | **${p.required}** |\n`;
      });
      md += '\n';
    }

    addSection('Details', obj.details, false);

    if (obj.example) {
      md += `<h3 id="${getAnchor(obj.name, 'Example')}">Example</h3>\n\n`;
      md += '```json\n';
      md += `${obj.example}\n`;
      md += '```\n\n';
    }

    md += '---\n\n';
  }
  return md;
}


async function main() {
  console.log('Starting DSON spec crawl...');
  if (!existsSync(PAGES_DIR)) {
    mkdirSync(PAGES_DIR, { recursive: true });
    console.log(`Created directory: ${PAGES_DIR}`);
  }

  const links = await getObjectLinks();
  const fullSchema: DsonObject[] = [];

  for (const link of links) {
    const pageUrl = new URL(link.url, BASE_URL).href;
    const pageFileName = `${link.name.replace(/ /g, '_')}.html`;
    const pagePath = path.join(PAGES_DIR, pageFileName);

    let html = '';
    if (existsSync(pagePath)) {
      console.log(`Using cached page for ${link.name}`);
      html = await Bun.file(pagePath).text();
    } else {
      console.log(`Downloading page for ${link.name}...`);
      const response = await fetch(pageUrl, FETCH_OPTIONS);
      if (!response.ok) {
        console.error(`Failed to download page ${pageUrl}: ${response.statusText}`);
        continue;
      }
      html = await response.text();
      await Bun.write(pagePath, html);
      console.log(`Saved page to ${pagePath}`);
      await new Promise(resolve => setTimeout(resolve, 200)); // Politeness delay
    }

    const parsedData = await parseObjectPage(html, pageUrl);
    fullSchema.push({ ...link, ...parsedData } as DsonObject);
  }

  // Sort alphabetically by name
  fullSchema.sort((a, b) => a.name.localeCompare(b.name));

  const jsonOutputPath = path.join(OUTPUT_DIR, 'full-schema.json');
  await Bun.write(jsonOutputPath, JSON.stringify(fullSchema, null, 2));
  console.log(`Wrote JSON schema to ${jsonOutputPath}`);

  const markdownOutputPath = path.join(OUTPUT_DIR, 'full-schema.md');
  const markdownContent = generateMarkdown(fullSchema);
  await Bun.write(markdownOutputPath, markdownContent);
  console.log(`Wrote Markdown schema to ${markdownOutputPath}`);

  console.log('Crawl complete.');
}

main().catch(console.error);