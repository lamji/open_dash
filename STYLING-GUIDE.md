# OpenDash Complete Styling Guide

## Overview
**Every component in OpenDash is now fully styleable.** Users can override any visual property using natural language commands.

---

## Table Components

### Table Container
```
"Make table border red"
"Change table background to white"
```
→ `containerStyle = {"borderColor":"red"}`

### Table Rows
```
"Make row backgrounds gray"
"Add blue border between rows"
```
→ `rowStyle = {"backgroundColor":"#f5f5f5"}`

### Column Headers
```
"Make all column headers white"
"Make column 1 header bold and red"
```
→ `columns[0].headerStyle = {"color":"white"}`

### Column Cells
```
"Make all cell text black"
"Make price column text green"
```
→ `columns[0].cellStyle = {"color":"black"}`

### Search Input
```
"Make table search placeholder color black"
"Make table search border color black"
```
→ `searchInputStyle = {"--placeholder-color":"black"}`

### Action Button (MoreHorizontal icon)
```
"Make action button red"
"Change action button size"
```
→ `columns[X].actionButtonStyle = {"color":"red"}`

### Action Menu (Dropdown)
```
"Make action menu background dark"
"Change action menu border"
```
→ `columns[X].actionMenuStyle = {"backgroundColor":"#333"}`

### Individual Action Items
```
"Make Edit action green"
"Make Delete action bold"
```
→ `columns[X].actions[0].style = {"color":"green"}`

---

## Analytics Cards

### Container (Grid Wrapper)
```
"Change analytics cards background"
"Add border to analytics grid"
```
→ `containerStyle = {"backgroundColor":"white"}`

### Individual Cards
```
"Make revenue card background blue"
"Change card 1 border color"
```
→ `cards[0].style = {"backgroundColor":"blue"}`

### Card Titles
```
"Make all card titles white"
"Make revenue card title bold"
```
→ `cards[0].titleStyle = {"color":"white"}`

### Card Values
```
"Make all card values larger"
"Change revenue value color to green"
```
→ `cards[0].valueStyle = {"fontSize":"32px"}`

---

## Charts

### Bar Chart Container
```
"Make bar chart background dark"
"Add border to bar chart"
```
→ `containerStyle = {"backgroundColor":"#1a1a1a"}`

### Bar Chart Title
```
"Make bar chart title white"
"Change chart title size"
```
→ `titleStyle = {"color":"white"}`

### Line Chart Container
```
"Make line chart background white"
"Add shadow to line chart"
```
→ `containerStyle = {"boxShadow":"0 4px 6px rgba(0,0,0,0.1)"}`

### Line Chart Title
```
"Make line chart title bold"
"Change title color to blue"
```
→ `titleStyle = {"fontWeight":"bold"}`

---

## UI Primitives

### Button
```
"Make button background red"
"Change button text color to white"
"Make button larger"
```
→ `style = {"backgroundColor":"red", "color":"white", "fontSize":"18px"}`

### Input
```
"Make input border blue"
"Change input background to gray"
"Make input text larger"
```
→ `style = {"borderColor":"blue", "backgroundColor":"#f5f5f5"}`

### Badge
```
"Make badge background purple"
"Change badge text color"
```
→ `style = {"backgroundColor":"purple", "color":"white"}`

### Card
```
"Make card background dark"
"Add shadow to card"
```
→ `style = {"backgroundColor":"#1a1a1a", "boxShadow":"0 4px 6px rgba(0,0,0,0.1)"}`

### Card Title
```
"Make card title white"
"Change card title size"
```
→ `titleStyle = {"color":"white", "fontSize":"24px"}`

### Card Content
```
"Make card content background gray"
"Add padding to card content"
```
→ `contentStyle = {"backgroundColor":"#f5f5f5", "padding":"20px"}`

---

## How It Works

1. **User asks**: "Make table search placeholder color black"
2. **AI generates**: `update_page_component` with `configPath:"searchInputStyle"` and `value:{"--placeholder-color":"black"}`
3. **Engine applies**: Inline style to the search `<Input>` component
4. **Result**: Placeholder color changes immediately

---

## Key Principles

✅ **Everything is styleable** — No hardcoded styles block user customization  
✅ **Natural language** — Users don't need to know CSS property names  
✅ **Inline styles** — All overrides use React `style` prop for maximum specificity  
✅ **Granular control** — Style individual elements (card 1 title) or groups (all column headers)  

---

## CSS Properties Supported

All standard React.CSSProperties:
- `color`, `backgroundColor`, `borderColor`
- `fontSize`, `fontWeight`, `fontFamily`
- `padding`, `margin`, `gap`
- `width`, `height`, `maxWidth`
- `boxShadow`, `borderRadius`
- `display`, `flexDirection`, `justifyContent`
- And **any other CSS property**

---

## Special Cases

### Placeholder Color
Uses CSS variable syntax:
```
searchInputStyle = {"--placeholder-color":"black"}
```

### Multiple Columns
Requires multiple actions:
```
columns[0].headerStyle = {"color":"white"}
columns[1].headerStyle = {"color":"white"}
columns[2].headerStyle = {"color":"white"}
```

### Nested Styles
Card with styled title and content:
```
style = {"backgroundColor":"white"}
titleStyle = {"color":"blue"}
contentStyle = {"padding":"20px"}
```
