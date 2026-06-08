import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const dashboardByRole = {
  0: '/admin/dashboard',
  1: '/seller/dashboard'
};

const getStoredRole = () => {
  const role = localStorage.getItem('sellerRole');
  return role === null ? null : Number(role);
};

const RoleRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const authRole = useSelector((state) => state.auth.role);
  const role = authRole !== null && authRole !== undefined ? Number(authRole) : getStoredRole();

  if (!allowedRoles.includes(role)) {
    return (
      <Navigate
        to={dashboardByRole[role] || '/login'}
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node.isRequired
};

export default RoleRoute;
