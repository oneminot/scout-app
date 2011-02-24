Array.prototype.last = function() {return this[this.length-1];}

var Projects = new Lawnchair({adaptor: 'air', table: "projects"});

// UI stuff
$(document).ready(function() {  
  // create new project
  $('.option.add').live('click', createProjectBySelectingDirectory);
  $('.content').live('drop', createProjectByDroppingADirectory)
  $('.projects').live(':changed', projectListChanged);
    
  // start/stop project
  $('.project .play').live('click', toggleWatch);
  $('.project .stop').live('click', toggleWatch);
  
  $('#select_sass_dir').live('click', selectInputBySelectingDirectory);
  $('#select_css_dir').live('click', selectOutputBySelectingDirectory);
  $('.project_details .delete').live('click', deleteProject);
  
  $('.project .source').live('click', function() {
    key = $(this).parents('.project:first').attr('data-key');
    Projects.get(key, function(project) {
     if(project) {
       $('.project_details').attr('data-key', key);
       $('#setting_sass_dir').html(project.sassDir);
       $('#setting_css_dir').html(project.cssDir);
     }
   });
  });
  
  $('#nuke').live('click', function(){
    Projects.nuke();
    $('.projects').trigger(':changed');
  });
  
  function createProjectBySelectingDirectory() {
    browseDirectories(function(evnt) {
      createProject(evnt.target.nativePath.replace(/\/$/, '').split('/').last(), evnt.target.nativePath, "");  
    });
  }

  function createProjectByDroppingADirectory(evnt){ 
    evnt.preventDefault();
    createProject(evnt.dataTransfer.getData("text/uri-list").replace(/\/$/, '').split('/').last(), "", "");
  }
  
  function toggleWatch() {
    var project_container = $(this).parents('.project:first');
    key = project_container.attr('data-key');
    Projects.get(key, function(project) {
      if(project_container.hasClass("stopped")) {
        project_container.trigger("watch:start", { project: project });
      } else {
        project_container.trigger("watch:stop");
      }
      project_container.toggleClass("playing");
      project_container.toggleClass("stopped");
    });
    return false;
  }
  
  function projectListChanged() {
    $('.projects').empty();
    Projects.all(function(project) {
      if(project) {
        $.tmpl($("#project-template"), project).appendTo(".projects");
      }
    });
  }
  projectListChanged();
});


function deleteProject() {
  key = $(this).parents('.project_details:first').attr('data-key');
  Projects.get(key, function(project) {
    Projects.remove(project);
  });
  $('.projects').trigger(':changed');
  return false;
}

function selectOutputBySelectingDirectory() {
  key = $(this).parents('.project_details:first').attr('data-key');
  browseDirectories(function(evnt){
    Projects.get(key, function(project) {
      project.cssDir = evnt.target.nativePath;
      Projects.save(project);
    });
    $('#setting_css_dir').html(evnt.target.nativePath);
  });
  return false;
}

function selectInputBySelectingDirectory() {
  key = $(this).parents('.project_details:first').attr('data-key');
  browseDirectories(function(evnt){
    Projects.get(key, function(project) {
      project.sassDir = evnt.target.nativePath;
      Projects.save(project);
    });
    $('#setting_sass_dir').html(evnt.target.nativePath);
  });
  return false;
}


function browseDirectories(callback) {
  var directory = air.File.documentsDirectory;
  try
  {
    directory.browseForDirectory("Select Directory");
    directory.addEventListener(air.Event.SELECT, callback);
  }
  catch (error)
  {
    air.trace("Failed:", error.message)
  }
}

function createProject(name, sassDir, cssDir) {
  Projects.save({
    name: name,
    sassDir: sassDir,
    cssDir: cssDir,
    environment: "development",
    outputStyle: "expanded"
  });
  $('.projects').trigger(':changed');
  $('.projects .project').last().children('.config').toggle();
}
