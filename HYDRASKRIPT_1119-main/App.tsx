import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { ProjectList } from './views/ProjectList';
import { BookGenesis } from './views/BookGenesis';
import { StoryBible } from './views/StoryBible';
import { StyleEngine } from './views/StyleEngine';
import { AudiobookStudio } from './views/AudiobookStudio';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/new" element={<BookGenesis />} />
          <Route path="/story-bible" element={<StoryBible />} />
          <Route path="/style-engine" element={<StyleEngine />} />
          <Route path="/audio-studio" element={<AudiobookStudio />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
