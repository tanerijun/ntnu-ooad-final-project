'use client'
import { useEffect, useState } from 'react'

type Session = {
  id: number
  start_time: string
  end_time: string
  duration: number
}

export default function StudyHistory() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:3333/api/timer')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setSessions(data))
      .catch((err) => {
        console.error('取得紀錄失敗：', err)
        setError('⚠️ 讀取失敗，請確認後端有開')
      })
  }, [])

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2>📜 讀書紀錄</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {sessions.length === 0 && !error && <p>暫無紀錄</p>}

      <ul>
        {sessions.map((s) => (
          <li key={s.id}>
            ⏱️ {new Date(s.start_time).toLocaleString()} → {new Date(s.end_time).toLocaleString()}，共 {s.duration} 秒
          </li>
        ))}
      </ul>
    </section>
  )
}
