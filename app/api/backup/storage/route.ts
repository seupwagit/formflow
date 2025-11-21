/**
 * API DE BACKUP DE ARQUIVOS DO SUPABASE STORAGE
 * 
 * Endpoint: POST /api/backup/storage
 * 
 * Criado em: 14/11/2024
 * Função: Baixar todos os arquivos do Supabase Storage
 * ⚠️ SEPARADO DO BACKUP DE BANCO - Evita gastos desnecessários
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupDir = join(process.cwd(), 'supabase', 'backup', 'storage', timestamp)
    
    await mkdir(backupDir, { recursive: true })

    const errors: string[] = []
    let totalFiles = 0
    let totalSize = 0
    const bucketDetails: any[] = []

    // 1. Listar todos os buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      return NextResponse.json({
        success: false,
        error: `Erro ao listar buckets: ${bucketsError.message}`
      }, { status: 500 })
    }

    console.log(`📦 Encontrados ${buckets?.length || 0} buckets`)

    // 2. Para cada bucket, baixar todos os arquivos
    for (const bucket of buckets || []) {
      try {
        const bucketDir = join(backupDir, bucket.name)
        await mkdir(bucketDir, { recursive: true })

        let bucketFiles = 0
        let bucketSize = 0

        // Listar arquivos do bucket
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list()

        if (filesError) {
          errors.push(`Erro ao listar arquivos do bucket ${bucket.name}: ${filesError.message}`)
          continue
        }

        console.log(`📁 Bucket ${bucket.name}: ${files?.length || 0} arquivos`)

        // Baixar cada arquivo
        for (const file of files || []) {
          try {
            // Pular pastas
            if (!file.name || file.name.endsWith('/')) continue

            // Download do arquivo
            const { data: fileData, error: downloadError } = await supabase.storage
              .from(bucket.name)
              .download(file.name)

            if (downloadError) {
              errors.push(`Erro ao baixar ${file.name}: ${downloadError.message}`)
              continue
            }

            if (fileData) {
              // Salvar arquivo
              const buffer = Buffer.from(await fileData.arrayBuffer())
              const filePath = join(bucketDir, file.name)
              await writeFile(filePath, buffer)

              bucketFiles++
              bucketSize += buffer.length
              totalFiles++
              totalSize += buffer.length

              console.log(`✅ Baixado: ${file.name} (${formatBytes(buffer.length)})`)
            }
          } catch (err) {
            errors.push(`Erro ao processar ${file.name}: ${err}`)
          }
        }

        bucketDetails.push({
          name: bucket.name,
          files: bucketFiles,
          size: formatBytes(bucketSize)
        })

      } catch (err) {
        errors.push(`Erro ao processar bucket ${bucket.name}: ${err}`)
      }
    }

    // 3. Criar README
    const readme = `
# BACKUP DE ARQUIVOS DO SUPABASE STORAGE

**Data:** ${new Date().toISOString()}
**Timestamp:** ${timestamp}

## 📊 RESUMO

- **Total de Arquivos:** ${totalFiles}
- **Tamanho Total:** ${formatBytes(totalSize)}
- **Buckets:** ${buckets?.length || 0}

## 📦 BUCKETS

${bucketDetails.map(b => `### ${b.name}\n- Arquivos: ${b.files}\n- Tamanho: ${b.size}\n`).join('\n')}

## ⚠️ IMPORTANTE

- Estes são os arquivos físicos do Storage
- Para restaurar, faça upload manual ou use a API do Supabase
- Mantenha este backup em local seguro

## 🔄 COMO RESTAURAR

### Via Supabase Dashboard:
1. Acesse o Storage no dashboard
2. Selecione o bucket
3. Faça upload dos arquivos

### Via API:
\`\`\`typescript
const file = await fs.readFile('path/to/file')
await supabase.storage
  .from('bucket-name')
  .upload('file-name', file)
\`\`\`
`
    await writeFile(join(backupDir, 'README.md'), readme)

    return NextResponse.json({
      success: true,
      timestamp,
      backupDir: `supabase/backup/storage/${timestamp}`,
      summary: {
        totalFiles,
        totalSize: formatBytes(totalSize),
        buckets: buckets?.length || 0
      },
      buckets: bucketDetails,
      errors
    })

  } catch (error) {
    console.error('❌ Erro no backup do storage:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

/**
 * Formatar bytes em formato legível
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
