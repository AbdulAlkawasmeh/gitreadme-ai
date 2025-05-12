// src/pages/Githubcall.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Githubcall() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      axios.post(
        'http://localhost:8000/github/callback',
        { code },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then(() => navigate('/dashboard'))
      .catch((err) => {
        console.error(err);
        alert("GitHub Login Failed");
      });
    }
  }, [searchParams, navigate]);

  return <div>Connecting to GitHub... please wait.</div>;
}
