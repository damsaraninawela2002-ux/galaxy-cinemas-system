import React from 'react';
import MovieForm from './MovieForm';

const AddMovie = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <MovieForm isEdit={false} />
    </div>
  );
};

export default AddMovie;
