import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Models from './pages/Models';
import ModelDetail from './pages/ModelDetail';
import Library from './pages/Library';
import Upload from './pages/Upload';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/models" element={<Models />} />
          <Route path="/model/:id" element={<ModelDetail />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/upload" element={<Upload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
