const { exec } = require("child_process");

const echozonePath = "../../dist/echozone-cmd.exe";

function play() {
  const cmd = `${echozonePath} LoadPlaylistInfo` 

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error.message);
      return;
    }

    if (stderr) {
      console.error("stderr:", stderr);
    }

    console.log("stdout:", stdout);
  });
}
