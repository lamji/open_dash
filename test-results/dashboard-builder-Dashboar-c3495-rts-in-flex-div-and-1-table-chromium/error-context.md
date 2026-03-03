# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "OpenDash" [ref=e4] [cursor=pointer]:
      - /url: /
      - img [ref=e6]
      - generic [ref=e11]: OpenDash
    - generic [ref=e13]:
      - generic [ref=e14]:
        - heading "Welcome back" [level=1] [ref=e15]
        - paragraph [ref=e16]: Log in to your OpenDash account
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: Invalid email or password
          - generic [ref=e20]:
            - generic [ref=e21]: Email
            - textbox "Email" [ref=e22]:
              - /placeholder: you@example.com
              - text: test@example.com
          - generic [ref=e23]:
            - generic [ref=e24]: Password
            - textbox "Password" [ref=e25]:
              - /placeholder: Enter your password
              - text: password123
          - button "Log In" [ref=e26]
        - paragraph [ref=e27]:
          - text: Don't have an account?
          - link "Sign up" [ref=e28] [cursor=pointer]:
            - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35]
  - alert [ref=e38]
```