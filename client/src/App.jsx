import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { BrowseGigs } from './pages/BrowseGigs';
import { GigDetails } from './pages/GigDetails';
import { CreateGig } from './pages/CreateGig';

import { HireFreelancer } from './pages/HireFreelancer';
// import { Messages } from './pages/Messages';

const App = () => {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <Toaster position="top-center" reverseOrder={false} />
                    <Routes>
                        <Route path="/login" element={<Auth />} />

                        <Route path="/" element={
                            <Layout>
                                <BrowseGigs />
                            </Layout>
                        } />

                        <Route path="/gigs/:id" element={
                            <Layout>
                                <GigDetails />
                            </Layout>
                        } />

                        <Route path="/create-gig" element={
                            <Layout>
                                <CreateGig />
                            </Layout>
                        } />

                        <Route path="/gigs/:id/hire" element={
                            <Layout>
                                <HireFreelancer />
                            </Layout>
                        } />

                        {/* <Route path="/messages" element={
                            <Layout>
                                <Messages />
                            </Layout>
                        } /> */}

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
};

export default App;
