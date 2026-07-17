import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { Alert, App, Button, Card, Col, Flex, Row, Segmented, Space, Table, Tag, Typography, Upload } from 'antd'
import type { UploadFile } from 'antd'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MemoryImportRecord } from '@/api/types'
import { writeMemories } from '@/api/modules/memory'
import { PageContainer } from '@/components/common'
import {
  buildWritePayload,
  modeMeta,
  resolveImportMode,
} from '@/pages/Ingestion/model'
import type { ImportMode } from '@/pages/Ingestion/model'
import { useAppStore } from '@/store'
import { getErrorMessage } from '@/utils/error'
import {
  getIngestionActivity,
  recordIngestionImport,
  recordIngestionValidation,
  summarizeIngestionActivity,
} from '@/utils/ingestionActivity'
import type { IngestionHistoryItem, IngestionImportStatus } from '@/utils/ingestionActivity'
import { parseMemoryImportText } from '@/utils/memoryImport'

const importStatusMeta: Record<IngestionImportStatus, { label: string; color: string }> = {
  completed: { label: '已完成', color: 'success' },
  partial: { label: '部分完成', color: 'warning' },
  failed: { label: '失败', color: 'error' },
}

const importTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function createHistoryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export default function IngestionPage() {
  const { message, modal } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const config = useAppStore((state) => state.config)
  const mode = resolveImportMode(searchParams.get('mode'))
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [records, setRecords] = useState<MemoryImportRecord[]>([])
  const [importing, setImporting] = useState(false)
  const [activity, setActivity] = useState(getIngestionActivity)

  const summary = summarizeIngestionActivity(activity, config.userId)
  const recentImports = activity.imports.filter((item) => item.userId === config.userId)
  const validationRate = summary.validationPassRate === null
    ? '—'
    : `${summary.validationPassRate.toFixed(1)}%`

  useEffect(() => {
    setRecords([])
    setFileList([])
  }, [mode])

  const applyModeChange = (nextMode: ImportMode) => {
    setRecords([])
    setFileList([])

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('mode', nextMode)
    setSearchParams(nextParams, { replace: true })
  }

  const handleModeChange = (value: string | number) => {
    const nextMode = resolveImportMode(String(value))
    if (nextMode === mode) return

    if (records.length || fileList.length) {
      modal.confirm({
        title: '确认切换导入模式？',
        content: '切换模式将清空当前已选择并解析的文件。',
        okText: '切换模式',
        cancelText: '继续当前导入',
        onOk: () => applyModeChange(nextMode),
      })
      return
    }

    applyModeChange(nextMode)
  }

  const handleFile = async (file: File) => {
    try {
      const parsed = parseMemoryImportText(file.name, await file.text())
      setRecords(parsed)
      setFileList([{ uid: file.name, name: file.name, status: 'done', size: file.size, type: file.type }])
      setActivity(recordIngestionValidation(activity, config.userId, true))
      void message.success(`已解析 ${parsed.length} 条${modeMeta[mode].label}数据`)
    } catch (error) {
      setRecords([])
      setFileList([])
      setActivity(recordIngestionValidation(activity, config.userId, false))
      void message.error(getErrorMessage(error, '文件解析失败'))
    }
    return false
  }

  const handleImport = async () => {
    if (!records.length) return
    setImporting(true)
    const source = fileList[0]?.name ?? '未命名导入文件'
    const totalCount = records.length
    const createdAt = new Date().toISOString()
    let successCount = 0
    let generatedCount = 0
    let status: IngestionImportStatus = 'failed'
    try {
      for (const record of records) {
        const result = await writeMemories(buildWritePayload(mode, record, config.userId, config.sceneId))
        successCount += 1
        generatedCount += result.results.length
      }
      status = 'completed'
      void message.success(`成功处理 ${successCount} 条导入记录，生成 ${generatedCount} 条记忆`)
      setRecords([])
      setFileList([])
    } catch (error) {
      status = successCount ? 'partial' : 'failed'
      void message.error(getErrorMessage(
        error,
        `已处理 ${successCount} 条导入记录并生成 ${generatedCount} 条记忆，后续数据处理失败`,
      ))
    } finally {
      const historyItem: IngestionHistoryItem = {
        id: createHistoryId(),
        userId: config.userId,
        agentId: config.agentId || undefined,
        mode,
        source,
        totalCount,
        successCount,
        resultCount: generatedCount,
        status,
        createdAt,
      }
      setActivity(recordIngestionImport(activity, historyItem))
      setImporting(false)
    }
  }

  return (
    <PageContainer
      title="智能体接入与记忆数据写入"
      description="统一接收智能体对话、历史会话与任务过程数据，完成校验后写入记忆生成流水线。"
      extra={<Tag color="blue">当前用户：{config.userId}</Tag>}
    >
      <Alert
        showIcon
        type="info"
        title="当前用户的本地真实统计"
        description="以下指标和最近导入批次由当前浏览器根据实际解析与写入结果计算，不代表后台全局统计。"
      />

      <Row gutter={[14, 14]}>
        {[
          {
            title: '本地 Agent 配置',
            value: config.agentId ? '1' : '0',
            note: config.agentId ? `Agent ID：${config.agentId}` : '尚未配置 Agent ID',
            icon: <RobotOutlined />,
            color: '#1677ff',
          },
          {
            title: '今日成功处理',
            value: summary.todaySuccessCount.toLocaleString('zh-CN'),
            note: `共 ${summary.todayBatchCount} 个提交批次`,
            icon: <CloudUploadOutlined />,
            color: '#22a884',
          },
          {
            title: '当前处理批次',
            value: importing ? '1' : '0',
            note: importing ? '正在顺序写入记录' : '当前无进行中批次',
            icon: <ClockCircleOutlined />,
            color: '#e49a28',
          },
          {
            title: '文件校验通过率',
            value: validationRate,
            note: summary.validationAttemptCount
              ? `${summary.validationSuccessCount} 成功 / ${summary.validationAttemptCount} 次`
              : '暂无本地校验记录',
            icon: <CheckCircleOutlined />,
            color: '#7b61d1',
          },
        ].map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card className="console-card ingestion-stat" variant="borderless">
              <Flex align="center" gap={12}>
                <div style={{ color: item.color, background: `${item.color}15` }}>{item.icon}</div>
                <div><Typography.Text type="secondary">{item.title}</Typography.Text><strong>{item.value}</strong><Typography.Text type="secondary">{item.note}</Typography.Text></div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[14, 14]}>
        <Col xs={24} xl={15}>
          <Card className="console-card" title="记忆数据导入" variant="borderless">
            <Space orientation="vertical" size={16} style={{ display: 'flex' }}>
              <Segmented
                block
                value={mode}
                disabled={importing}
                options={(Object.keys(modeMeta) as ImportMode[]).map((key) => ({ label: modeMeta[key].label, value: key }))}
                onChange={handleModeChange}
              />
              <div>
                <Typography.Title level={5} style={{ margin: 0 }}>{modeMeta[mode].title}</Typography.Title>
                <Typography.Text type="secondary">{modeMeta[mode].description}</Typography.Text>
              </div>
              <Upload.Dragger
                accept=".json,.csv"
                disabled={importing}
                maxCount={1}
                fileList={fileList}
                beforeUpload={handleFile}
                onRemove={() => {
                  setFileList([])
                  setRecords([])
                }}
              >
                <p className="ant-upload-drag-icon"><CloudUploadOutlined /></p>
                <p className="ant-upload-text">拖拽 JSON / CSV 文件到此处，或点击选择文件</p>
                <p className="ant-upload-hint">支持批量记录；CSV 至少包含 content 字段</p>
              </Upload.Dragger>
              <Flex justify="space-between" align="center" wrap gap={12}>
                <Typography.Text>{records.length ? `已解析 ${records.length} 条记录` : '尚未选择文件'}</Typography.Text>
                <Button type="primary" icon={<FileTextOutlined />} disabled={!records.length} loading={importing} onClick={() => void handleImport()}>
                  校验并写入
                </Button>
              </Flex>
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={9}>
          <Card className="console-card" title="数据格式说明" variant="borderless">
            <Space orientation="vertical" size={14}>
              <div>
                <Tag color={modeMeta[mode].color}>{modeMeta[mode].label}</Tag>
                <Typography.Text>{modeMeta[mode].fields.join('、')}</Typography.Text>
              </div>
              <Typography.Paragraph type="secondary">
                当前模式支持仅提供 content；系统会将其映射为
                {mode === 'dialogue' ? '对话消息' : mode === 'session' ? '会话摘要' : '任务进展'}。
              </Typography.Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card className="console-card" title="最近导入批次" variant="borderless">
        <Table
          size="small"
          pagination={false}
          rowKey="id"
          dataSource={recentImports}
          locale={{ emptyText: '当前用户在本浏览器暂无导入记录' }}
          columns={[
            { title: '数据来源', dataIndex: 'source' },
            {
              title: '数据类型',
              dataIndex: 'mode',
              render: (value: ImportMode) => <Tag color={modeMeta[value].color}>{modeMeta[value].label}</Tag>,
            },
            {
              title: '成功/总数',
              render: (_value: unknown, item: IngestionHistoryItem) => `${item.successCount}/${item.totalCount}`,
            },
            { title: '处理结果数', dataIndex: 'resultCount' },
            {
              title: '处理状态',
              dataIndex: 'status',
              render: (value: IngestionImportStatus) => (
                <Tag color={importStatusMeta[value].color}>{importStatusMeta[value].label}</Tag>
              ),
            },
            {
              title: '提交时间',
              dataIndex: 'createdAt',
              render: (value: string) => importTimeFormatter.format(new Date(value)),
            },
          ]}
        />
      </Card>
    </PageContainer>
  )
}
