from photostereo import photometry
import cv2 as cv
import numpy as np
import time, sys, glob, os, re

def generate_normal_map(name, format):
    root_fold = f'{os.path.join(os.getcwd(), 'uploads')}/'
    out_fold = f'{os.path.join(os.getcwd(), 'output')}/'
    #print(f'{root_fold}*{name}*.*.{format}')
    filelist = []
    print(root_fold)
    for file in os.listdir(root_fold):
        if re.match(fr"{name}\.[0-9]+{format}", file):
            filelist.append(file)

    #glob.glob(f'{root_fold}*{name}*.[0-9]*{format}')
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
    print(image_array)
    # LOADING LIGHTS FROM FILE
    fs = cv.FileStorage(root_fold + f'{name}_LightMatrix.yml', cv.FILE_STORAGE_READ)
    fn = fs.getNode("Lights")
    light_mat = fn.mat()
    myps.setlightmat(light_mat)
    #print(myps.settsfromlm())

    tic = time.process_time()
    mask = cv.imread(root_fold + f'{name}.mask' + format, cv.IMREAD_GRAYSCALE)
    normal_map = myps.runphotometry(image_array, np.asarray(mask, dtype=np.uint8))
    normal_map = cv.normalize(normal_map, None, 0, 255, cv.NORM_MINMAX, cv.CV_8UC3)
    #albedo = myps.getalbedo()
    #albedo = cv.normalize(albedo, None, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1)

    cv.imwrite(f'{out_fold}{name}_normal_map.png',normal_map)
    #cv.imwrite('albedo.png',albedo)
    #cv.imwrite('gauss.png',gauss)
    #cv.imwrite('med.png',med)

    toc = time.process_time()
    print("Process duration: " + str(toc - tic))
    sys.stdout.flush()
    cv.waitKey(0)
    cv.destroyAllWindows()