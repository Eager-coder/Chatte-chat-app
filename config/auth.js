module.exports = {
    ensureAuthenticated: (req, res, next)=>  {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error', 'Please log in to proceed');
      res.redirect('/account/login');
    },
    forwardAuthenticated: (req, res, next) => {
      if (!req.isAuthenticated()) {
        return next();
      }
      // res.redirect('/main');      
    }
  };