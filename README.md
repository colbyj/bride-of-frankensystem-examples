# bride-of-frankensystem-examples
Example projects for the Bride of Frankensystem.

## Instructions
The example projects will run if BOFS has been installed via pip. You must use the `BOFS` command from your command 
line to start each project.

It is recommended that you install BOFS via a virtual environment. The steps for doing this are:
1. Create the venv with: `python -m venv bofs_venv`
2. Activate the venv.
   * In Windows this is done via `.\bofs_venv\Scripts\activate.bat` if using `cmd` or `.\bofs_venv\Scripts\Activate.ps1` 
     if using Powershell (the default command line in Windows 11).
   * In MacOS or Linux this is done via `source bofs_venv/bin/activate`
3. Install BOFS via pip:
   * `pip install bride-of-frankensystem`
4. Ensure that you can execute the `BOFS` command. Try it without any arguments and you should see a help message.


### Minimal Example
The minimal example is a minimal project that only contains questionnaires.

To run the example, ensure that your working directory is the same directory as the `.toml` file and run:
 - `BOFS minimal.toml -d` for the debug version (for development).
 - `BOFS minimal.toml` for the production version.

### Advanced Example
The advanced example is a project that demonstrates most of the capabilities of Bride of Frankensystem.

To run the example, ensure that your working directory is the same directory as the `.toml` file and run:
 - `BOFS advanced.toml -d` for the debug version (for development).
 - `BOFS advanced.toml` for the production version.

### Unity Example
The `unity_example` demonstrates one approach for integrating a Unity project into BOFS. It includes source code for a
Unity project alongside the BOFS project.

To run the example, ensure that your working directory is the same directory as the `.toml` file and run:
 - `BOFS unity_example.toml -d` for the debug version (for development).
 - `BOFS unity_example.toml` for the production version.

## Running in PyCharm

Run BOFS as a module, set the working directory to the example project you're interested in, and specify the `.toml` file for that project.

![Screenshot of PyCharm](pycharm_run.png)