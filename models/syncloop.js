module. exports = {
synchIt: function(iterations, process, exit)
{

  var index = 0,
  done = false,
  shouldExit = false;
  var loop =
  {
    next: function()
    {
      if(done)
      {
        if(shouldExit && exity)
        {
          return exit;
        }
      }
      if(index < iterations)
      {

        index ++;
        process(loop);
      }
      else
      {
          done = true;
          if(exit) exit();
      }
    },
    iteration: function()
    {
      return index -1;
    },
    break: function(end)
    {
      done = true;
      shouldExit = end;
    }
  };
  loop.next();
  return loop;
},
synchIt1: function(iterations, process, exit)
{

  var index = 0,
  done = false,
  shouldExit = false;
  var loop1 =
  {
    next: function()
    {
      if(done)
      {
        if(shouldExit && exity)
        {
          return exit;
        }
      }
      if(index < iterations)
      {
        index ++;
        process(loop1);
      }
      else
      {
          done = true;
          if(exit) exit();
      }
    },
    iteration: function()
    {
      return index -1;
    },
    break: function(end)
    {
      done = true;
      shouldExit = end;
    }
  };
  loop1.next();
  return loop1;
}
}
