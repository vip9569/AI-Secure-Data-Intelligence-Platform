# 🔐 AI Secure Data Intelligence Platform


AI Secure Data Intelligence Platform is an AI-powered security platform that analyzes logs, text, files, and SQL queries to detect sensitive data like passwords, API keys, tokens, and potential security risks.

It uses **FastAPI (Python)** for backend and integrates with **Gemini API** for deep AI analysis.

---

## 🚀 Features

* 🔍 Detect sensitive data (passwords, API keys, tokens)
* 🤖 AI-powered analysis using Gemini API
* ⚠️ Risk scoring (Low → Critical)
* 🛡️ Automatic masking of sensitive data
* 📊 Insights and recommendations
* 📁 File upload support (logs, txt, pdf, etc.)
* 🧠 Smart summary generation

---

## 🏗️ Tech Stack

* Backend: Python, FastAPI
* AI: Gemini API
* Data Processing: Pandas, PyMuPDF, python-docx
* Server: Uvicorn

---

## 📂 Project Structure

```
backend/
│
├── app/
│   ├── routers/
│   ├── analyzer/
│   ├── parsers/
│   ├── models/
│
├── main.py
├── requirements.txt
├── .env
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/vip9569/AI-Secure-Data-Intelligence-Platform.git
cd AI-Secure-Data-Intelligence-Platform/backend
```

---

### 2️⃣ Create Virtual Environment

```
python -m venv venv
```

Activate:

**Windows**

```
venv\Scripts\activate
```

**Mac/Linux**

```
source venv/bin/activate
```

---

### 3️⃣ Install Dependencies

```
pip install -r requirements.txt
```

---

### 4️⃣ Setup Environment Variables

Create `.env` file:

```
GEMINI_API_KEY=your_api_key_here
```

---

### 5️⃣ Run Server

```
uvicorn app.main:app --reload
```

---

### 6️⃣ Open API Docs

```
http://127.0.0.1:8000/docs
```

---

## 🧪 Example API Request

### POST `/api/analyze`

```
{
  "input_type": "log",
  "content": "password=admin123 api_key=sk-xyz",
  "options": {
    "mask": true,
    "block_high_risk": false,
    "log_analysis": true
  }
}
```

---

## 📤 Example Response

```
{
  "risk_score": 8,
  "risk_level": "critical",
  "summary": "Sensitive data detected...",
  "findings": [...],
  "insights": [...]
}
```

---

## 🌐 Deployment

This project is deployed on platform:

* Render

## ⚠️ Notes


## 🙌 Author

Vikas Yadav

---

## ⭐ If you like this project

Give it a ⭐ on GitHub!
