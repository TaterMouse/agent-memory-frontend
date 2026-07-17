import { CheckCircleOutlined, CloudUploadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Alert, Card, Col, Row, Table, Tag, Typography, Upload } from 'antd'
import { useState } from 'react'
import type { UploadFile } from 'antd'
import type { MemoryImportRecord } from '@/api/types'
import { PageContainer } from '@/components/common'
import { showErrorMessage, showSuccessMessage } from '@/utils/feedback'
import { parseMemoryImportText } from '@/utils/memoryImport'

export default function DataValidationPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [records, setRecords] = useState<MemoryImportRecord[]>([])

  const handleFile = async (file: File) => {
    try {
      const parsed = parseMemoryImportText(file.name, await file.text())
      setRecords(parsed)
      setFileList([{ uid: file.name, name: file.name, status: 'done', size: file.size, type: file.type }])
      showSuccessMessage(`校验通过，共识别 ${parsed.length} 条标准记录。`)
    } catch (error) {
      setRecords([])
      setFileList([{ uid: file.name, name: file.name, status: 'error', size: file.size, type: file.type }])
      showErrorMessage(error, '数据校验未通过')
    }
    return false
  }

  const fieldCoverage = records.length
    ? Math.round(records.filter((record) => record.scene_id || record.task_id).length / records.length * 100)
    : 0

  return (
    <PageContainer
      title="数据校验与标准化"
      description="在正式写入前检查 JSON/CSV 结构、必填字段和角色取值，并预览标准化结果。"
    >
      <Row gutter={[14, 14]}>
        <Col xs={24} md={8}>
          <Card className="console-card result-stat" variant="borderless">
            <Typography.Text type="secondary">已识别记录</Typography.Text>
            <strong>{records.length}</strong>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="console-card result-stat" variant="borderless">
            <Typography.Text type="secondary">结构校验</Typography.Text>
            <strong style={{ color: records.length ? '#20a47c' : undefined }}>{records.length ? '已通过' : '待校验'}</strong>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="console-card result-stat" variant="borderless">
            <Typography.Text type="secondary">场景/任务字段覆盖</Typography.Text>
            <strong>{fieldCoverage}%</strong>
          </Card>
        </Col>
      </Row>

      <Card className="console-card" title="上传待校验数据" variant="borderless">
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
          <p className="ant-upload-hint">校验只在当前浏览器执行，不会直接写入后端</p>
        </Upload.Dragger>
      </Card>

      <Alert
        type="info"
        showIcon
        icon={<SafetyCertificateOutlined />}
        title="当前校验规则"
        description="记录必须包含 content，或提供会话摘要/任务目标/任务进展等可转换字段；role 仅允许 user、assistant、system。"
      />

      <Card className="console-card" title="标准化结果预览" variant="borderless">
        <Table<MemoryImportRecord>
          rowKey={(_, index) => String(index)}
          size="small"
          dataSource={records}
          locale={{ emptyText: '上传文件后将在此显示校验与标准化结果。' }}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 760 }}
          columns={[
            { title: '状态', width: 90, render: () => <Tag icon={<CheckCircleOutlined />} color="success">通过</Tag> },
            { title: '标准内容', dataIndex: 'content', ellipsis: true },
            { title: '角色', dataIndex: 'role', width: 100, render: (value?: string) => value || 'user' },
            { title: 'Scene ID', dataIndex: 'scene_id', width: 140, render: (value?: string) => value || '-' },
            { title: 'Task ID', dataIndex: 'task_id', width: 140, render: (value?: string) => value || '-' },
          ]}
        />
      </Card>
    </PageContainer>
  )
}
