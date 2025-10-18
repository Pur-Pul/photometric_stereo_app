|   Date  | Hours | Commits |
|---------|-------|---------|
| 5.7.2025|   2.5h|first commit. basic express server and mongo docker setup. updated hours. Added basic frontend with a login component|
| 6.7.2025|     3h|Implemented client sided image upload. Added image upload api|
| 8.7.2025|   3.5h|Multifile upload. Updated hours. Altered image naming convention. Started implementing photostereo python script in backend|
| 9.7.2025|     3h|Started working on a python server for the photostereo script. Python server generates normal maps. Updated hours. Added a handler that checks if images are of equal size and format.|
|10.7.2025|   2.5h|An all white mask image is now generated in the frontend. the photostereo server now processes images submitted in the frontend|
|14.7.2025|     4h|Moved the entire application into docker compose|
|15.7.2025|     2h|Created a docker development environment. Normal map file names are now stored in the database and added components for viewing normal maps|
|16.7.2025|   3.5h|Created a development version of the photostereo server and generated normal maps are now displayed in the frontend. Improved navbar|
|17.7.2025|   3.5h|Added session table, validation on access and expiration on logout. Automatic deletion of ouput images and sessions after a specified expiry time.|
|18.7.2025|     3h|Improved dev environment, uploaded files are now deleted automatically and started making a light direction selector. Created a functional but simple light direction selector popup and styled some button elements with mui. Added a download button and did some more styling|
|19.7.2025|   2.5h|Started making a light direction picker with plotly.|
|21.7.2025|   4.5h|The light direction plot now visualizes light direction in relation to the image. Improved light direction visualization|
|22.7.2025|     2h|Added vector, polygon and sphere classes. Light direction can now be selected by clicking in the visualisation.|
|23.7.2025|     4h|Made a simple mask editor|
|24.7.2025|     4h|Improved the performance of the mask editor and added and image overlay and pencil size selector. Fixed some bugs with uploading and implemented save function for mask editor.|
|25.7.2025|     3h|Created a color picker did some styling and bugfixing.|
|26.7.2025|     1h|added an endpoint for uploading a manually created normalmap.|
|28.7.2025|     4h|Ajusted structure so the docker containers don't create an empty nod_modules. Implemented backend testing. Actions test. Actions test 2. Actions test 3. Updated hours|
|29.7.2025|     3h|Logout and image router testing. Image router testing|
|30.7.2025|   5.5h|Actions test 4. Prevented remnants of test from staying in database. Image router testing. Began refactoring of how normal maps are saved in order to support layers.|
|31.7.2025|   2.5h|Converted some tests to the new backend structure. Refactored delete endpoint to work with the new normal map backend. Delete endpoint testing.|
| 4.8.2025|   3.5h|Added an endpoint for normal map post and continued testing normal map endpoints. More normal map post endpoint testing and also linting the backend.|
| 5.8.2025|   3.5h|Started making a manual normal map editor. Created a layer selector and added the functionality to create new layers.|
| 6.8.2025|   3.5h|Fixed issues canvas resizing in normal map editor. Improved color picker, styled navbar and fixing some more scaling bugs.|
| 7.8.2025|   3.5h|Added undo and redo function into normal map editor. Rearranged app layout. Created a form where the user chooses method of normal map creation. Styling.|
| 8.8.2025|   2.5h|Created the pipett tool and did some styling in the editor.|
|11.8.2025|     4h|Added eraser tool and a cursor to the editor that shows the size of the selected tool. Styling the editor and implementing save endpoint in backend.|
|12.8.2025|   3.5h|Bug fixes for the save function. Layers are now flattened into a single image in the normalmap view. Started implementing shape tool. Also started implementing low resolution icons for the normalmaps.|
|13.8.2025|     4h|Continued implementation of normal map icons and the shape tool.|
|14.8.2025|     2h|Testing backend and fixing various bugs.|
|15.8.2025|     4h|Bug fixing and updated the mask editor to use the newer editor component. Shape tool now interprets black as transparent color. Fixed a bug in the photometry script, which caused mask background to be grey instead of black.|
|18.8.2025|     6h|Started creating a preview for the normal map applied to 3d objects. uv mapping sphere and added rotation to preview.|
|19.8.2025|     3h|Implemented lighting which utilizes the normal map in the shader.|
|20.8.2025|   5.5h|The color of the 3d preview can be now be changed. The 3d preview can be rotated using mouse input. Fixed a light direction bug in the shaders. Added specular reflections. Optimized preview animation.|
|21.8.2025|     2h|3d vsiualize can now display a cube. A texture can be uploaded and applied to the shape in the visualizer.|
|22.8.2025|     2h|Added user roles 'user' and 'admin'. Normal maps now have a visibility field 'public' or 'private'. Updated tests for normal maps and users.|
|25.8.2025|   3.5h|Normal maps can now be manually named. Updated tests to include name parameter for normal maps. The user is now prompted for a name when creating normal maps.|
|26.8.2025|     4h|Fixed a bug that prevented icons from being updated. Normal maps can now be uploaded in the new normal map form. Improved input validation in new normal map form. Uploaded normal maps are now saved in backend. Visibility can be changed in normalmap view.|
|27.8.2025|     3h|Separated production, develpment and test databases. Removed 'format' field from image model. Started making frontend components tests. Added test for login component. Attempting to fix github actions not running tests. Attempting to fix github actions not running tests. Attept 2. Attempting to fix github actions not running tests. Attempt 3|
|28.8.2025|     2h|Added tests for NavBar and NormalMapList.|
|29.8.2025|     5h|More tests for normal map list and form. Optimized shape tool for large source images on smaller canvases. Tests for manual options and changed some canvas settings to allow for pixel art.|
| 1.9.2025|     2h|Added tests for Upload options component. Added tests for name form and layer selector|
| 2.9.2025|   3.5h|Added tests for tool button and color selector.|
| 4.9.2025|   2.5h|Added test for PhotometricForm and changed how validation in the form works.|
| 5.9.2025|   4.5h|Moved flat image and icon generation to backend.|
| 8.9.2025|     3h|Database is initialized with a default admin user if it does not exist and ADMIN_PASS is defined. Added user role to login router response. Personal and public normal maps are now separated into two different lists. User component displays the user's public normalmaps with the normalMapList component. Some styling.|
| 9.9.2025|   2.5h|Implemented paginated loading of normal maps. Some styling|
|10.9.2025|   2.5h|Added frontend tests to github actions. Fixed production docker compose. Improvements to user list component. adjusted total hours. user list table can now be sorted by each header.|
|11.9.2025|   3.5h|Added backend handlers for deleting and updating users. User delete testing. User update testing. Fixed a bug in the cube mesh that caused one of the sides to be flipped.|
|12.9.2025|     4h|Added a delete button adn form to user page. Added a username edit field to user page. Updated hours. User view is now a functional form for updating or deleting profile.|
|15.9.2025|     1h|Started making a user creation form. Started implementing email verification in the backend. Updated tests to be compatible with email and verified fields on user objects.|
|16.9.2025|   1.5h|Progress on email verifiaction endpoint. Added a failsafe for missing images.|
|17.9.2025|     2h|Improved error handling in normal map reducer when requested images are not found.|
|18.9.2025|   2.5h|A verification link is now sent to the provided email on user creation. Emails are now prevented from being sent by tests. Potential fix for github actions tests.|
|23.9.2025|   2.5h|Added sorting to photomatric stereo form. Fixed a bug, which made generated normal maps un editable. Adjusted total hours.|
|24.9.2025|     5h|Render yaml test. Reverted render.yaml test. Added ssl to nginx for production. Switched to correct port for ssl. Preparations for self hosted deployment. Fixed a bug in production that caused page reloads to result in 404. photostereo service uid bug fix. Updated hours.|
|30.9.2025|   3.5h|Cloudflare setup. Fixed broken compose. Fixed a bug that prevented transition from photostereo form to new normal map. Added an automatic refresh when request normal map is not found.|
|1.10.2025|   2.5h|Created a frontpage component with instructions. Some styling.|
|2.10.2025|   3.5h|More instructions and styling. Fixed a bug that prevented layers from updating on client side. Fixed a bug that caused layers to remain after being removed.|
|3.10.2025|   2.5h|Error handling for single image in photometric form. Frontend linting.|
|10.10.2025|  5.5h|photostereo.py script is now imported from the source, which is included as a git submodule. Merge and some linitng. Removed ssl environment. Added instructions for installation, setup and how to use the editor. Linting. Fixed typo.|
|13.10.2025|    5h|Optimizations, frontend linting and styling. Mask editor now fits properly into its dialog. Changed overlay checkbox into an opacity slider.|
|17.10.2025|    3h|Health check action. Health check endpoint. setup script. Fixed a bug which caused invalid tokens to persist. Invalid token fix 2 and setup script adjustments. Instructions, styling and linting. Created a descriptive hour list. Added setup script to readme|
|18.20.2025|    1h|Fixed a bug which cause the editor to be to large. Opened up the normal map list to non logged in users. Opened up front page to non logged users. Optimized the Viewer3D component.|
|     Total|206.5h||
