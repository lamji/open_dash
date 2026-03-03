# How to Build Dashboard Stat Cards with AI Chat

This guide shows you how to build a professional analytics dashboard with 4 stat cards using natural conversation with the AI.

## What You'll Build

A dashboard with 4 cards in a row:
1. **Team Payments** — Shows approval status and team count
2. **Savings** — Line chart with amount and trend
3. **Income Statistics** — Bar chart with growth percentage
4. **Best Plan** — Premium card with pricing and CTA buttons

## How to Use

1. Open your dashboard at `http://localhost:3000`
2. Open the AI chat panel
3. Copy and paste each prompt from the files below **in order**
4. Wait for the AI to complete each step before moving to the next

## Step-by-Step Prompts

| Step | File | What It Does |
|------|------|-------------|
| 1 | `01-clear-dashboard.md` | Clear the page to start fresh |
| 2 | `02-outer-grid-container.md` | Create a wrapper to hold all 4 cards |
| 3 | `03-card1-team-payments.md` | Build the Team Payments card |
| 4 | `04-card2-savings.md` | Build the Savings card with chart |
| 5 | `05-card3-income-statistics.md` | Build the Income Statistics card |
| 6 | `06-card4-best-plan.md` | Build the premium pricing card |

## Tips for Talking to AI

- **Be conversational**: Say "create me a card" not technical JSON
- **Build block by block**: Start with containers, then add content inside
- **Always reference the parent**: Say "inside the wrapper div" or "inside the grid container" so the AI knows where to place components
- **Use component language**: Say "text component", "button component", "chart component" (not raw HTML)
- **Describe what you want**: "dashed border, rounded corners, white background"
- **Use natural styling terms**: "teal gradient", "bold text", "small red text"
- **Wait between steps**: Let the AI finish one card before starting the next

## Example Conversation Flow

```
You: Clear everything from the dashboard page.
AI: ✓ Dashboard cleared.

You: Create me a div wrapper in the dashboard. Make it display as a grid with 4 columns.
AI: ✓ Grid container created.

You: Inside the wrapper, add the first card with a dashed border...
AI: ✓ Card added.

... and so on
```

## What the AI Understands

- Layout terms: "wrapper", "container", "grid", "flex", "columns"
- Styling: "dashed border", "rounded corners", "gradient", "white background"
- Content: "heading", "text", "button", "chart", "badge"
- Positioning: "at the top", "below that", "at the bottom"
- Colors: "teal", "red", "green", "muted", "white"

Just describe what you want to see, and the AI will build it!

## Common Mistakes to Avoid

❌ **Don't say**: "add text" (AI might create raw HTML)
✅ **Do say**: "add a text component" or "create a heading component"

❌ **Don't forget the parent**: "add a card"
✅ **Always reference parent**: "inside the wrapper div, add a card"

❌ **Don't skip the wrapper**: Going straight to cards without the grid container
✅ **Build in order**: Wrapper first, then cards inside it
