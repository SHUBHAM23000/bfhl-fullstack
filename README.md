# Hierarchy Builder

A REST API that processes node hierarchies and builds trees from them.

## What it does

- POST /bfhl endpoint for hierarchy processing
- Validates node format (X->Y)
- Finds invalid entries and duplicates
- Builds tree structures
- Detects cycles
- Calculates tree depth
- Returns summary stats
- Clean frontend UI
- CORS enabled
- Can deploy anywhere

## Project Structure

```
.
├── api/
│   ├── index.js
│   ├── bfhl.js
│   └── utils.js
├── public/
│   └── index.html
├── package.json
└── vercel.json
```

## Setup

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Usage

```bash
curl -X POST http://localhost:3000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data": ["A->B", "A->C", "B->D"]}'
```

## Deploy

Push to GitHub and deploy on Vercel:
1. Connect your GitHub repo
2. Click Deploy
3. Get your API URL

## Config

Update your credentials in `api/utils.js` before deploying:
```javascript
user_id: "yourname_ddmmyyyy"
email_id: "your.email@college.edu"
college_roll_number: "21CS1001"
```

## How it works

- Format: X->Y (single uppercase letters only)
- Invalid entries get tracked
- Duplicates are removed (first one kept)
- Trees built from valid edges
- Detects cycles with DFS
- Returns depth as longest path length

## Example

Input:
```
A->B
A->C
B->D
X->Y
Y->Z
Z->X
hello
1->2
```

Returns hierarchies with tree A, cycle at X, plus stats.

## Performance

Processes 50 nodes in < 1 second. Works on Vercel, Render, Railway, etc.

## Submit

- Update credentials in utils.js
- Push to GitHub
- Deploy on Vercel
- Submit API URL + Frontend URL + Repo URL
