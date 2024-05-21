import glob, os

executable_path = "/Users/sony0627/Programming/COLLADA2GLTF/build/COLLADA2GLTF-bin"
folder_path = "/Users/sony0627/Desktop/brawlers"
print("Converting all .dae files in " + folder_path + " to .gltf files")

for file in glob.glob(folder_path + "/*/**.dae", recursive=True):
    # print(file)
    os.system(executable_path + " -i " + file + " -o " + file.replace(".dae", ".gltf"))
    print("Converted " + file + " to " + file.replace(".dae", ".gltf"))
