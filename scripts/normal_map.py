from photostereo import photometry
import cv2 as cv
import time
import numpy as np
import sys

name = sys.argv[1]
IMAGES = int(sys.argv[2])
root_fold = f"../uploads/"
obj_name = f"{name}."
format = f".{sys.argv[3]}"

#Load input image array
image_array = []
for id in range(0, IMAGES):
    try:
        filename = root_fold + str(obj_name) + str(id) + format
        im = cv.imread(root_fold + str(obj_name) + str(id) + format, cv.IMREAD_GRAYSCALE)
        image_array.append(im)
    except cv.error as err:
        print(err)

myps = photometry(IMAGES, False)

# LOADING LIGHTS FROM FILE
fs = cv.FileStorage(root_fold + "LightMatrix.yml", cv.FILE_STORAGE_READ)
fn = fs.getNode("Lights")
light_mat = fn.mat()
myps.setlightmat(light_mat)
#print(myps.settsfromlm())

tic = time.process_time()
mask = cv.imread(root_fold + "mask" + format, cv.IMREAD_GRAYSCALE)
normal_map = myps.runphotometry(image_array, np.asarray(mask, dtype=np.uint8))
normal_map = cv.normalize(normal_map, None, 0, 255, cv.NORM_MINMAX, cv.CV_8UC3)
#albedo = myps.getalbedo()
#albedo = cv.normalize(albedo, None, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1)

cv.imwrite('normal_map.png',normal_map)
#cv.imwrite('albedo.png',albedo)
#cv.imwrite('gauss.png',gauss)
#cv.imwrite('med.png',med)

toc = time.process_time()
print("Process duration: " + str(toc - tic))
sys.stdout.flush()
cv.waitKey(0)
cv.destroyAllWindows()