import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { App, Button, Card, Col, Flex, Row, Segmented, Space, Table, Tag, Typography, Upload } from 'antd'
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
import { showErrorMessage, showSuccessMessage } from '@/utils/feedback'
import { parseMemoryImportText } from '@/utils/memoryImport'

const recentImports = [
  { key: '1', source: '物流调度智能体', type: '历史会话', count: 128, status: '已完成', time: '今天 10:32' },
  { key: '2', source: '客服助手智能体', type: '对话记录', count: 86, status: '处理中', time: '今天 09:48' },
  { key: '3', source: '订单处理智能体', type: '任务过程', count: 42, status: '已完成', time: '昨天 18:20' },
]

export default function IngestionPage() {
  const { modal } = App.useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const config = useAppStore((state) => state.config)
  const mode = resolveImportMode(searchParams.get('mode'))
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [records, setRecords] = useState<MemoryImportRecord[]>([])
  const [importing, setImporting] = useState(false)

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
      showSuccessMessage(`已解析 ${parsed.length} 条${modeMeta[mode].label}数据`)
    } catch (error) {
      setRecords([])
      setFileList([])
      showErrorMessage(error, '文件解析失败')
    }
    return false
  }

  const handleImport = async () => {
    if (!records.length) return
    setImporting(true)
    let successCount = 0
    let generatedCount = 0
    try {
      for (const record of records) {
        const result = await writeMemories(buildWritePayload(mode, record, config.userId, config.sceneId))
        successCount += 1
        generatedCount += result.results.length
      }
      showSuccessMessage(`成功处理 ${successCount} 条导入记录，生成 ${generatedCount} 条记忆`)
      setRecords([])
      setFileList([])
    } catch (error) {
      showErrorMessage(error, `已处理 ${successCount} 条导入记录并生成 ${generatedCount} 条记忆，后续数据处理失败`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <PageContainer
      title="智能体接入与记忆数据写入"
      description="统一接收智能体对话、历史会话与任务过程数据，完成校验后写入记忆生成流水线。"
      extra={<Tag color="blue">当前用户：{config.userId}</Tag>}
    >
      <Row gutter={[14, 14]}>
        {[
          { title: '接入智能体', value: '128', note: '已登记并分配场景', icon: <RobotOutlined />, color: '#1677ff' },
          { title: '今日写入', value: '12,480', note: '较昨日增长 6.2%', icon: <CloudUploadOutlined />, color: '#22a884' },
          { title: '待处理批次', value: '3', note: '均在预计时间内', icon: <ClockCircleOutlined />, color: '#e49a28' },
          { title: '数据校验通过率', value: '99.6%', note: '字段与格式自动校验', icon: <CheckCircleOutlined />, color: '#7b61d1' },
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
          dataSource={recentImports}
          columns={[
            { title: '数据来源', dataIndex: 'source' },
            { title: '数据类型', dataIndex: 'type', render: (value: string) => <Tag>{value}</Tag> },
            { title: '记录数', dataIndex: 'count' },
            { title: '处理状态', dataIndex: 'status', render: (value: string) => <Tag color={value === '处理中' ? 'processing' : 'success'}>{value}</Tag> },
            { title: '提交时间', dataIndex: 'time' },
          ]}
        />
      </Card>
    </PageContainer>
  )
}
