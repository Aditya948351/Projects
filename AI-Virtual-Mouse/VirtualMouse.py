import tkinter as tk
from tkinter import messagebox, simpledialog
import subprocess
import re
import os

# You can change the password accordingly
PASSWORD = "123"

def start_virtual_mouse():
    name = name_entry.get()
    password = password_entry.get()

    if not validate_name(name):
        messagebox.showwarning("Invalid Name", "Please input a valid name.")
        return

    if name.lower() == "aditya" and password == PASSWORD:
        result = messagebox.askquestion("Confirmation", "Welcome Sir, do you want to turn on the virtual mouse program?")
        if result == 'yes':
            countdown(3)
            # Specify the full path to Python executable and the script path
            python_path = r"C:\Users\Acer\Desktop\venv\Scripts\python.exe"  # Adjust if you're using virtualenv
            script_path = r"D:\zensar\AI_virtualMouse"
            subprocess.Popen([python_path, script_path])  # Run the script using subprocess
        else:
            feedback = simpledialog.askstring("Feedback", "Please provide feedback:")
            if feedback:
                messagebox.showinfo("Thank You", "Thank you for your feedback!")
            else:
                messagebox.showinfo("Information", "No feedback provided.")

            root.quit()
    else:
        messagebox.showwarning("Invalid User", "You are not authorized to use this program.")

def countdown(count):
    label.config(text=f"Starting in {count} seconds...")
    if count > 0:
        root.after(1000, countdown, count - 1)
    else:
        label.config(text="")
        root.update()

def validate_name(name):
    pattern = r'^[a-zA-Z ]+$'
    return bool(re.match(pattern, name))

def exit_program():
    feedback = simpledialog.askstring("Feedback", "Please provide feedback:")
    if feedback:
        messagebox.showinfo("Thank You", "Thank you for your feedback!")
    else:
        messagebox.showinfo("Information", "No feedback provided.")
    root.quit()

root = tk.Tk()
root.title("Virtual Mouse Control")

screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()

root.geometry(f"{screen_width}x{screen_height}")
root.configure(bg='lightblue')

name_label = tk.Label(root, text="Name:", bg='lightblue')
name_label.pack(pady=(10, 0))
name_entry = tk.Entry(root)
name_entry.pack(pady=5)

password_label = tk.Label(root, text="Password:", bg='lightblue')
password_label.pack()
password_entry = tk.Entry(root, show="*")
password_entry.pack(pady=(0, 10))

start_btn = tk.Button(root, text="Start Virtual Mouse", command=start_virtual_mouse)
start_btn.pack(pady=10)

exit_btn = tk.Button(root, text="Exit", command=exit_program)
exit_btn.pack(pady=10)

label = tk.Label(root, text="", bg='lightblue')
label.pack()

root.mainloop()
