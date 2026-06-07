import { useEffect, useState } from "react";
import { consultationApi } from "../api/consultationApi";

export default function useConsultations() {
  const [consultations, setConsultations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const fetchConsultations =
    async () => {
      try {
        setLoading(true);

        const res =
          await consultationApi.getAll();

       // setConsultations(res.data);
       const data = res.data;

setConsultations(
  Array.isArray(data)
    ? data
    : data?.data || data?.consultations || []
);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return {
    consultations,
    setConsultations,
    loading,
    error,
    fetchConsultations,
  };
}