from photostereo import photometry
import cv2 as cv
import numpy as np
import time, sys, os, re, requests

def clear_upload(name):
    root_fold = f'{os.path.join(os.getcwd(), '../uploads')}/'
    for file in os.listdir(root_fold):
        if re.match(fr"{name}.*", file):
            file_path = os.path.join(root_fold, file)
            print(f'Deleting file {file_path}')
            os.remove(file_path)

def generate_normal_map(dest_file, name, format):
    root_fold = f'{os.path.join(os.getcwd(), '../uploads')}/'
    
    filelist = []
    print(root_fold)
    for file in os.listdir(root_fold):
        if re.match(fr"{name}\.[0-9]+{format}", file):
            filelist.append(file)
    IMAGES = len(filelist)
    for file in filelist:
        print(file)
    obj_name = f"{name}."
    
    #Load input image array
    image_array = []
    for id in range(0, IMAGES):
        try:
            filename = root_fold + str(obj_name) + str(id) + format
            im = cv.imread(filename, cv.IMREAD_GRAYSCALE)
            image_array.append(im)
        except cv.error as err:
            print(err)

    myps = photometry(IMAGES, False)
    # LOADING LIGHTS FROM FILE
    fs = cv.FileStorage(root_fold + f'{name}_LightMatrix.yml', cv.FILE_STORAGE_READ)
    fn = fs.getNode("Lights")
    light_mat = fn.mat()
    myps.setlightmat(light_mat)

    tic = time.process_time()
    mask = cv.imread(root_fold + f'{name}.mask' + format, cv.IMREAD_GRAYSCALE)
    normal_map = myps.runphotometry(image_array, np.asarray(mask, dtype=np.uint8))
    normal_map = cv.normalize(normal_map, None, 0, 255, cv.NORM_MINMAX, cv.CV_8UC3)

    cv.imwrite(dest_file, normal_map)
    print(dest_file)

    toc = time.process_time()
    print("Process duration: " + str(toc - tic))
    
    cv.waitKey(0)
    cv.destroyAllWindows()

if __name__ == "__main__":
    file = f'{os.path.normpath(os.path.join(os.getcwd(), '../output'))}/{sys.argv[1]}_0.png' 
    name = sys.argv[2]
    format = sys.argv[3]
    url = f'{sys.argv[4]}/{sys.argv[1]}'
    try:
        generate_normal_map(file, name, format)
        res = requests.put(url, json={
            "file": file,
            "format": ".png",
            "status": "done"
        })
    except Exception as e:
        print(e)
        res = requests.put(url, json={
            "file": file,
            "format": ".png",
            "status": f"Unkown error: {e}"
        })
    #clear_upload(name)
    sys.stdout.flush()