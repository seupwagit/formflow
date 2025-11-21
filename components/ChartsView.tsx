'use client'

import { useMemo } from 'react'
import { FormField } from '@/lib/types'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Users, 
  FileText,
  Hash,
  CheckCircle
} from 'lucide-react'

interface ChartsViewProps {
  responses: any[]
  fields: FormField[]
}

export default function ChartsView({ responses, fields }: ChartsViewProps) {
  // Estatísticas gerais
  const stats = useMemo(() => {
    const total = responses.length
    const statusCounts = responses.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {} as {[key: string]: number})

    // Dados por data
    const dateData = responses.reduce((acc, r) => {
      const date = new Date(r.created_at).toLocaleDateString('pt-BR')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as {[key: string]: number})

    // Dados por mês
    const monthData = responses.reduce((acc, r) => {
      const date = new Date(r.created_at)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as {[key: string]: number})

    return {
      total,
      statusCounts,
      dateData,
      monthData
    }
  }, [responses])

  // Estatísticas por campo
  const fieldStats = useMemo(() => {
    return fields.map(field => {
      const values = responses
        .map(r => r.response_data?.[field.name])
        .filter(v => v !== null && v !== undefined && String(v).trim() !== '')

      const uniqueValues = Array.from(new Set(values))
      const valueCounts = values.reduce((acc, v) => {
        const key = String(v)
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {} as {[key: string]: number})

      return {
        field,
        totalResponses: values.length,
        uniqueValues: uniqueValues.length,
        valueCounts,
        fillRate: (values.length / responses.length) * 100
      }
    })
  }, [responses, fields])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-500'
      case 'draft': return 'bg-yellow-500'
      case 'reviewed': return 'bg-blue-500'
      case 'approved': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const renderBarChart = (data: {[key: string]: number}, title: string, color: string = 'bg-blue-500') => {
    const entries = Object.entries(data).sort(([,a], [,b]) => b - a)
    const maxValue = Math.max(...entries.map(([,v]) => v))

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-600 truncate" title={key}>
                {key}
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div
                    className={`${color} h-4 rounded-full transition-all duration-500`}
                    style={{ width: `${(value / maxValue) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-medium text-gray-900 text-right">
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPieChart = (data: {[key: string]: number}, title: string) => {
    const entries = Object.entries(data)
    const total = entries.reduce((sum, [,value]) => sum + value, 0)
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
    ]

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {entries.map(([key, value], index) => {
            const percentage = ((value / total) * 100).toFixed(1)
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`} />
                  <span className="text-sm text-gray-700">{key}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {value} ({percentage}%)
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">Nenhum dado para análise</h3>
        <p className="text-sm text-gray-500">
          Não há dados suficientes para gerar gráficos e estatísticas
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Análise e Gráficos</h3>
          <p className="text-sm text-gray-500">Estatísticas baseadas em {responses.length} registro(s)</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Respostas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enviadas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.statusCounts.submitted || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rascunhos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.statusCounts.draft || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-2xl font-semibold text-gray-900">
                {responses.filter(r => {
                  const created = new Date(r.created_at)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return created >= weekAgo
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        {renderPieChart(stats.statusCounts, 'Distribuição por Status')}

        {/* Submissions by Month */}
        {Object.keys(stats.monthData).length > 1 && 
          renderBarChart(stats.monthData, 'Submissões por Mês', 'bg-blue-500')
        }
      </div>

      {/* Field Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Estatísticas dos Campos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa de Preenchimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respostas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valores Únicos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Mais Comum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fieldStats.map((stat) => {
                const mostCommon = Object.entries(stat.valueCounts)
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]

                return (
                  <tr key={stat.field.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {stat.field.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stat.field.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${stat.fillRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">
                          {stat.fillRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.totalResponses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.uniqueValues}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mostCommon ? (
                        <div>
                          <div className="font-medium">
                            {String(mostCommon[0]).length > 20 
                              ? String(mostCommon[0]).substring(0, 17) + '...' 
                              : String(mostCommon[0])
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            {mostCommon[1] as number} ocorrência(s)
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Value Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {fieldStats
          .filter(stat => stat.uniqueValues > 1 && stat.uniqueValues <= 10)
          .slice(0, 4)
          .map(stat => 
            renderBarChart(
              stat.valueCounts, 
              `Distribuição: ${stat.field.label}`,
              'bg-indigo-500'
            )
          )
        }
      </div>
    </div>
  )
}