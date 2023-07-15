import os

# get my flag.txt with os.environ
def main():
        filename = "flag.txt"
        if os.path.isfile(filename):
            with open(filename, "r") as file:
                content = file.read()
                print(content)
        else:
            print("File tidak ditemukan.")

main()
