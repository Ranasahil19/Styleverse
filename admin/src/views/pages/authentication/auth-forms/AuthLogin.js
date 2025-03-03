import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { useSelector , useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { signInSeller } from 'features/authSlice';
import { useEffect } from 'react';
import { resetAuthState } from 'features/authSlice';
import CustomSnackbar from 'component/CustomSnackbar';

const FirebaseLogin = ({ ...others }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const { loading , error , message ,role} = useSelector((state) => state.auth);
  const [openSnackbar , setOpenSnackbar] = useState(false);
  const [snackbarMessage , setSnackbarMessage] = useState('');
  const [snackbarSeverity , setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if( message || error){
      setSnackbarMessage(message || error);
      setSnackbarSeverity(message? 'success' : 'error');
      setOpenSnackbar(true);
      setTimeout(() => {
        dispatch(resetAuthState());
      }, 1500);
    }
  }, [message , error , dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetAuthState()); // Reset auth state on component unmount or page change
    };
  }, [location.pathname]);
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    if(snackbarSeverity === 'success'){
      setTimeout(() => {
        if (role === '1') {
          navigate("/seller/dashboard");
        } else if (role === '0') {
          navigate("/admin/dashboard");
        } else {
          navigate("/login"); 
        }
      }, 200);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signInSeller(formData));
  };

  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        {/* <Grid item xs={12} container alignItems="center" justifyContent="center">
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Sign in with Email address</Typography>
          </Box>
        </Grid> */}
      </Grid>
      <form noValidate onSubmit={handleSubmit} {...others}>
        <FormControl fullWidth  margin="normal" variant="outlined">
          <InputLabel htmlFor="userName"> Username</InputLabel>
          <OutlinedInput id="userName" type="text" name="userName" value={formData.userName} onChange={handleChange} label="Username" />
        </FormControl>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            label="Password"
            endAdornment={
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword}>
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {/* Remember Me (Left) */}
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} color="primary" />}
          label={<Typography variant="subtitle1">Remember me</Typography>}
        />
        
        {/* Forgot Password (Right) */}
        <Button 
          onClick={() => navigate('/forgot-password')}
          variant="text" 
          color="primary" 
          sx={{ textTransform: 'none', fontSize: '0.9rem' }}
        >
          Forgot password?
        </Button>
      </Box>

        <Box sx={{ mt: 2 }}>
          <AnimateButton>
            <Button fullWidth size="large" type="submit" variant="contained" color="secondary">
              {loading ? <CircularProgress/> :"Sign in"}
            </Button>
          </AnimateButton>
        </Box>
      </form>

      <CustomSnackbar open={openSnackbar} onClose={handleCloseSnackbar} severity={snackbarSeverity} message={snackbarMessage}/>

    </>
  );
};

export default FirebaseLogin;
