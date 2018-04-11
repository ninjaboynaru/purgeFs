# purgefs
A simple cmd line utility to delete all files AND folders (recursively) that match a name or regex (JavaScript regex).
Not fully tested - **use at your own risk**.

1. This package should be installed globally
> npm install -g purgefs

2. Then call from the cmd line
> purgefs -p ./path_to_start_deleting -n name of folder and files to delete (accepts regex expressions)

3. Wait for the scan to finish
4. Press enter to confirm, or any other key to cancel

**EXAMPLE**  
**Delete all files and folders with the name *"node_modules"*, in the current directory**
> purgefs -p . -n node_modules  
