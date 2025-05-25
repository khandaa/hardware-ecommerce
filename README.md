# Hardware E-commerce Application

A full-stack e-commerce application for selling hardware products with detailed specifications and product imagery.

## Features

- Browse hardware products with detailed specifications
- View multiple product images (at least 5 per product)
- Filter products by categories and specifications
- Add products to shopping cart
- Secure checkout with Razorpay payment integration
- User authentication and order history
- Admin panel for product management

## Tech Stack

- **Frontend**: React.js with Material UI and Bootstrap for responsive design
- **Backend**: Python Flask RESTful APIs
- **Database**: SQLite
- **Payment Gateway**: Razorpay

## Directory Structure

```
hardware_ecommerce/
├── frontend/           # React frontend
├── backend/            # Flask backend
├── database/           # SQLite database
├── docs/               # Documentation
├── test/               # Test files
├── .gitignore
├── README.md
└── CHANGELOG.md
```

## Setup Instructions

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:
- See `.env.example` for required environment variables

## API Documentation

API documentation is available in the `/docs` directory.

## Testing

```bash
# Run backend tests
cd test/backend
python -m pytest

# Run frontend tests
cd frontend
npm test
```

## License

MIT
