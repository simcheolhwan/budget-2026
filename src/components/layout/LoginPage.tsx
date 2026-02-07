import { useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import styles from "./LoginPage.module.css"
import { signIn, useAuth } from "@/lib/auth"

// 로그인 페이지
export function LoginPage() {
  const { status } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: "/" })
    }
  }, [status, navigate])

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
      <button className={styles.loginButton} type="button" onClick={() => signIn()}>
        Google로 로그인
      </button>
    </div>
  )
}
