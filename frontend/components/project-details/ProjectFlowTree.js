import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import ReactFlow, { Background, Controls, MiniMap, Handle, Position } from 'react-flow-renderer';
import 'react-flow-renderer/dist/style.css';
import 'react-flow-renderer/dist/theme-default.css';
import { useSelector } from 'react-redux';
import { useGetThemeQuery } from '@/features/themeApiSlice';

const userStories = [
  { 
    id: 'story-1',
    title: "Login Feature", 
    developer: "Bob", 
    status: "deployed" 
  },
  { 
    id: 'story-2',
    title: "Payment Flow", 
    developer: "Carol", 
    status: "dev-fix" 
  },
];

// Custom Done Node (no bottom handle)
const DoneNode = ({ data }) => (
  <div style={{
    background: '#14b8a6',
    color: 'white',
    borderRadius: 16,
    minWidth: 180,
    textAlign: 'center',
    fontWeight: 600,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  }}>
    <Handle type="target" position={Position.Top} style={{ background: '#14b8a6' }} />
    {data.label}
  </div>
);

// Build nodes and edges for the flow
const nodes = [
  {
    id: 'manager',
    type: 'input',
    data: { label: 'Manager: Alice' },
    position: { x: 350, y: 0 },
    style: { background: '#6366f1', color: 'white', borderRadius: 16, fontWeight: 600, minWidth: 180, textAlign: 'center', fontSize: 16 },
  },
  // User Stories, Developers, AI Code, Status for each story
  ...userStories.flatMap((story, idx) => {
    const x = idx === 0 ? 100 : 600;
    if (idx === 0) {
      // Left branch: ensure AI Code, Deployed, Done all have the same x for straight edge
      return [
        {
          id: `story-1`,
          data: { label: story.title },
          position: { x, y: 120 },
          style: { background: '#818cf8', color: 'white', borderRadius: 16, minWidth: 180, textAlign: 'center', fontWeight: 600, fontSize: 16 },
        },
        {
          id: `dev-1`,
          data: { label: `Dev: ${story.developer}` },
          position: { x, y: 220 },
          style: { background: '#a78bfa', color: 'white', borderRadius: 16, minWidth: 180, textAlign: 'center', fontWeight: 600, fontSize: 16 },
        },
        {
          id: `ai-1`,
          data: { label: 'AI Code' },
          position: { x, y: 320 },
          style: { background: '#10b981', color: 'white', borderRadius: 16, minWidth: 180, textAlign: 'center', fontWeight: 600, fontSize: 16 },
        },
        {
          id: `status-1`,
          data: { label: 'Deployed' },
          position: { x, y: 420 }, // perfectly aligned
          style: {
            background: '#3b82f6',
            color: 'white',
            borderRadius: 16,
            minWidth: 180,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16,
          },
        },
        {
          id: `done-1`,
          type: 'done',
          data: { label: 'Done' },
          position: { x, y: 520 }, // perfectly aligned
          style: {
            background: '#14b8a6',
            color: 'white',
            borderRadius: 16,
            minWidth: 180,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16,
          },
        },
      ];
    } else {
      // Right branch: Dev Fix -> Deployed -> Done, with proper spacing
      const deployedX = x - 80;
      const devFixX = x + 160;
      return [
        {
          id: `story-2`,
          data: { label: story.title },
          position: { x, y: 120 },
          style: { background: '#818cf8', color: 'white', borderRadius: 16, minWidth: 180, textAlign: 'center', fontWeight: 600, fontSize: 16 },
        },
        {
          id: `dev-2`,
          data: { label: `Dev: ${story.developer}` },
          position: { x, y: 220 },
          style: { background: '#a78bfa', color: 'white', borderRadius: 16, minWidth: 180, textAlign: 'center', fontWeight: 600, fontSize: 16 },
        },
        {
          id: `ai-2`,
          data: { label: 'AI Code' },
          position: { x, y: 320 },
          style: { background: '#10b981', color: 'white', borderRadius: 16, minWidth: 180, textAlign: 'center', fontWeight: 600, fontSize: 16 },
        },
        {
          id: `deployed-2`,
          data: { label: 'Deployed' },
          position: { x: deployedX, y: 420 },
          style: {
            background: '#3b82f6',
            color: 'white',
            borderRadius: 16,
            minWidth: 180,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16,
          },
        },
        {
          id: `status-2`,
          data: { label: 'Dev Fix' },
          position: { x: devFixX, y: 420 },
          style: {
            background: '#f59e0b',
            color: 'white',
            borderRadius: 16,
            minWidth: 180,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16,
          },
        },
        {
          id: `deployed-2b`,
          data: { label: 'Deployed' },
          position: { x: devFixX, y: 520 },
          style: {
            background: '#3b82f6',
            color: 'white',
            borderRadius: 16,
            minWidth: 180,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16,
          },
        },
        {
          id: `done-2a`,
          type: 'done',
          data: { label: 'Done' },
          position: { x: deployedX, y: 520 },
          style: {
            background: '#14b8a6',
            color: 'white',
            borderRadius: 16,
            minWidth: 180,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16,
          },
        },
        {
          id: `done-2b`,
          type: 'done',
          data: { label: 'Done' },
          position: { x: devFixX, y: 620 },
          style: {
            background: '#14b8a6',
            color: 'white',
            borderRadius: 16,
            minWidth: 180,
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 16,
          },
        },
      ];
    }
  })
];

const edges = [
  // Manager to user stories
  { id: 'e-mgr-story-1', source: 'manager', target: 'story-1', animated: true },
  { id: 'e-mgr-story-2', source: 'manager', target: 'story-2', animated: true },
  // Left branch
  { id: 'e-story-dev-1', source: 'story-1', target: 'dev-1' },
  { id: 'e-dev-ai-1', source: 'dev-1', target: 'ai-1' },
  { id: 'e-ai-status-1', source: 'ai-1', target: 'status-1', type: 'straight' },
  { id: 'e-status-done-1', source: 'status-1', target: 'done-1' },
  // Right branch
  { id: 'e-story-dev-2', source: 'story-2', target: 'dev-2' },
  { id: 'e-dev-ai-2', source: 'dev-2', target: 'ai-2' },
  { id: 'e-ai-deployed-2', source: 'ai-2', target: 'deployed-2' },
  { id: 'e-ai-status-2', source: 'ai-2', target: 'status-2' },
  { id: 'e-status-deployed-2b', source: 'status-2', target: 'deployed-2b' },
  { id: 'e-deployed-done-2a', source: 'deployed-2', target: 'done-2a' },
  { id: 'e-deployed-2b-done-2b', source: 'deployed-2b', target: 'done-2b' },
];

const nodeTypes = { done: DoneNode };

const ProjectFlowTree = () => {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const userInfo = useSelector(state => state.auth.userInfo);
  const userId = userInfo?._id || userInfo?.id;
  const { data: themePreferenceData } = useGetThemeQuery(userId, { skip: !userId });
  const theme = themePreferenceData?.theme || 'light';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.body.classList.contains('dark'));
    }
  }, []);

  return (
    <Box sx={{ 
      p: 4, 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
    }}>
      {/* Title with Back Button (single row, only at the top) */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        mb: 4,
        width: "100%",
        maxWidth: "1200px"
      }}>
        <IconButton 
          onClick={() => router.back()} 
          sx={{ 
            mr: 2,
            color: "#4f46e5",
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          color: theme === 'dark' ? '#f0f0f0' : '#222',
        }}>
          Project Flow Tree
        </Typography>
      </Box>
      {/* React Flow Tree */}
      <div style={{ width: '100%', height: '70vh', maxWidth: 1200, overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnScroll={true}
          panOnScroll={true}
          fitView
          fitViewOptions={{ padding: 0.2, includeHiddenNodes: true }}
          minZoom={0.7}
          maxZoom={1.5}
          nodeTypes={nodeTypes}
        >
          <Background />
          <MiniMap
            style={{
              height: 120,
              width: 220,
              background: theme === 'dark' ? '#18181b' : '#fff',
              borderRadius: 16,
              boxShadow: theme === 'dark'
                ? '0 4px 24px rgba(0,0,0,0.7)'
                : '0 4px 24px rgba(0,0,0,0.12)',
              border: `2px solid ${theme === 'dark' ? '#27272a' : '#e5e7eb'}`
            }}
            maskColor="transparent"
            position="bottom-right"
            nodeColor={n => n.style?.background || '#6366f1'}
            nodeStrokeColor={n => n.style?.background || '#fff'}
          />
          <Controls />
        </ReactFlow>
      </div>
    </Box>
  );
};

export default ProjectFlowTree;