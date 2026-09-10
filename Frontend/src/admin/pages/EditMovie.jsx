import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MovieForm from './MovieForm';
import SkeletonLoader from '../components/SkeletonLoader';
import movieService from '../../services/movieService';
import toast from 'react-hot-toast';

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await movieService.getMovie(id);
        if (data) {
          setMovie(data);
        } else {
          toast.error('Movie not found in catalog');
          navigate('/admin/movies');
        }
      } catch (err) {
        toast.error('Movie not found in catalog');
        navigate('/admin/movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <SkeletonLoader rows={8} cols={2} />
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <MovieForm initialData={movie} isEdit={true} />
    </div>
  );
};

export default EditMovie;
