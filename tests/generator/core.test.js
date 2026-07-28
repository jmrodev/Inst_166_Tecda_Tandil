import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/generator/config', () => ({
  CONFIG: {
    excludes: [
      'node_modules', '.git', 'dist', '*.md',
      '.DS_Store', 'links.txt', '*.txt',
    ],
    wordExtensions: ['.doc', '.docx'],
  },
  logDebug: vi.fn(),
  logProgress: vi.fn(),
}))

import { formatName, isExcluded, isWordDocument } from '../../src/generator/file-utils'
import { generateHTML } from '../../src/generator/html-generator'

describe('formatName', () => {
  it('removes file extension', () => {
    expect(formatName('documento.docx')).toBe('Documento')
  })

  it('replaces underscores with spaces', () => {
    expect(formatName('informe_anual.pdf')).toBe('Informe Anual')
  })

  it('converts "anio" to "año"', () => {
    expect(formatName('resumen_anio.docx')).toBe('Resumen AñO')
  })

  it('lowercases and capitalizes first letter', () => {
    expect(formatName('README.md')).toBe('Readme')
  })

  it('handles multiple extensions removing only the last one', () => {
    expect(formatName('archive.tar.gz')).toBe('Archive.Tar')
  })

  it('handles empty string', () => {
    expect(formatName('')).toBe('')
  })

  it('handles name without extension', () => {
    expect(formatName('Makefile')).toBe('Makefile')
  })
})

describe('isExcluded', () => {
  it('excludes node_modules', () => {
    expect(isExcluded('node_modules')).toBe(true)
  })

  it('excludes .git directory', () => {
    expect(isExcluded('.git')).toBe(true)
  })

  it('excludes .DS_Store', () => {
    expect(isExcluded('.DS_Store')).toBe(true)
  })

  it('excludes files matching *.md pattern', () => {
    expect(isExcluded('README.md')).toBe(true)
  })

  it('excludes links.txt exact match', () => {
    expect(isExcluded('links.txt')).toBe(true)
  })

  it('excludes files matching *.txt pattern', () => {
    expect(isExcluded('notas.txt')).toBe(true)
  })

  it('allows regular document files', () => {
    expect(isExcluded('documento.docx')).toBe(false)
  })

  it('allows pdf files', () => {
    expect(isExcluded('presentacion.pdf')).toBe(false)
  })
})

describe('isWordDocument', () => {
  it('detects .doc files', () => {
    expect(isWordDocument('.doc')).toBe(true)
  })

  it('detects .docx files', () => {
    expect(isWordDocument('.docx')).toBe(true)
  })

  it('rejects .pdf files', () => {
    expect(isWordDocument('.pdf')).toBe(false)
  })

  it('rejects .pptx files', () => {
    expect(isWordDocument('.pptx')).toBe(false)
  })

  it('rejects .txt files', () => {
    expect(isWordDocument('.txt')).toBe(false)
  })

  it('rejects empty extension', () => {
    expect(isWordDocument('')).toBe(false)
  })
})

describe('generateHTML', () => {
  it('generates HTML with breadcrumb for nested path', () => {
    const html = generateHTML('Test Title', { dirs: [], files: [] }, 'content/subdir')
    expect(html).toContain('Inicio')
    expect(html).toContain('../content/index.html')
    expect(html).toContain('../content/subdir/index.html')
  })

  it('generates breadcrumb without path as root', () => {
    const html = generateHTML('Root', { dirs: [], files: [] }, '')
    expect(html).toContain('Inicio')
    expect(html).not.toContain('undefined')
  })

  it('generates breadcrumb with undefined path safely', () => {
    const html = generateHTML('Root', { dirs: [], files: [] }, undefined)
    expect(html).toContain('Inicio')
    expect(html).not.toContain('undefined')
  })

  it('includes title in the HTML', () => {
    const html = generateHTML('Mi Título', { dirs: [], files: [] }, '')
    expect(html).toContain('Mi Título')
  })

  it('generates directory boxes when dirs are present', () => {
    const html = generateHTML('Dirs', { dirs: [{ name: 'subdir' }], files: [] }, 'root')
    expect(html).toContain('class="tech-box"')
    expect(html).toContain('subdir/index.html')
  })

  it('generates file table when files are present', () => {
    const html = generateHTML('Files', { dirs: [], files: [{ name: 'test.pdf', ext: '.pdf' }] }, 'root')
    expect(html).toContain('class="comparison-table"')
    expect(html).toContain('pdf-viewer.html')
  })

  it('includes word viewer link for .docx files', () => {
    const html = generateHTML('Word', { dirs: [], files: [{ name: 'doc.docx', ext: '.docx' }] }, 'root')
    expect(html).toContain('word-viewer.html')
  })

  it('shows empty state when no dirs or files', () => {
    const html = generateHTML('Empty', { dirs: [], files: [] }, '')
    expect(html).toContain('No hay contenido disponible')
  })

  it('handles undefined items with default parameter', () => {
    const html = generateHTML('Undefined', undefined, '')
    expect(html).toContain('No hay contenido disponible')
  })

  it('builds rootPath as single dot for root', () => {
    const html = generateHTML('Root', { dirs: [], files: [] }, '')
    expect(html).toContain('href="./index.html"')
  })

  it('builds rootPath as parent-dirs for nested path', () => {
    const html = generateHTML('Nested', { dirs: [], files: [] }, 'a/b/c')
    expect(html).toContain('href="../../../index.html"')
  })
})
