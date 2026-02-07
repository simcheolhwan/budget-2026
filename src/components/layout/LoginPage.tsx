import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import styles from "./LoginPage.module.css"
import { signIn, useAuth } from "@/lib/auth"

// 로그인 페이지
export function LoginPage() {
  const { status } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: "/" })
    }
  }, [status, navigate])

  const handleSignIn = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      await signIn()
    } catch (e) {
      const message = e instanceof Error ? e.message : "로그인에 실패했습니다"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  if (status === "loading" || status === "authenticated") return null

  if (status === "unauthorized") {
    return (
      <div className={styles.login}>
        <p className={styles.accessDenied}>접근 권한이 없습니다</p>
      </div>
    )
  }

  return (
    <div className={styles.login}>
      <button
        className={styles.loginButton}
        type="button"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading && <span className={styles.spinner} aria-hidden />}
        Google로 로그인
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
