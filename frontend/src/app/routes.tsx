import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { OpponentAnalysis } from './pages/OpponentAnalysis';
import { PlayerAssignments } from './pages/PlayerAssignments';
import { SquadAssignments } from './pages/SquadAssignments';
import { MatchLibrary } from './pages/MatchLibrary';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { PlayerComparison } from './pages/PlayerComparison';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'opponent-analysis', Component: OpponentAnalysis },
      { path: 'my-assignments', Component: PlayerAssignments },
      { path: 'squad-assignments', Component: SquadAssignments },
      { path: 'match-library', Component: MatchLibrary },
      { path: 'settings', Component: Settings },
      { path: 'player-comparison/:opponentPlayerId', Component: PlayerComparison },
    ],
  },
]);
