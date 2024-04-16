import os
import threading
import time

from selenium import webdriver
from BOFS.create_app import create_app
from selenium.webdriver.common.by import By


def start_app():
    config = "p5_example/p5_example.toml"
    path = os.path.dirname(os.path.abspath(config))

    app = create_app(path, config.split('/')[1], False, False)
    port = 5000  # Default to port 5000 if it's not set.

    app.run('127.0.0.1', port)


def test_client():
    browser = webdriver.Firefox()
    browser.get('http://127.0.0.1:5000/')

    assert browser.current_url == 'http://127.0.0.1:5000/consent'

    browser.find_element(By.ID, 'consentNo').click()
    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/consent'  # No consent given, so don't redirect

    browser.find_element(By.ID, 'consentYes').click()
    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/instructions/task_instructions'

    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/simple/my_task'

    canvas = browser.find_element(By.TAG_NAME, 'canvas')
    canvas.click()
    canvas.click()
    canvas.click()

    time.sleep(5)  # Wait for the redirection to happen

    assert browser.current_url == 'http://127.0.0.1:5000/end'

    print("Client tests successful!")
    browser.quit()

    # Why browser not closing?


def test_admin():
    browser = webdriver.Firefox()
    browser.get('http://127.0.0.1:5000/admin')

    assert browser.current_url == 'http://127.0.0.1:5000/admin/login'

    password_input = browser.find_element(By.ID, 'password')
    password_input.send_keys('example')

    browser.find_element(By.ID, 'submit').click()

    assert browser.current_url == 'http://127.0.0.1:5000/admin/progress'

    browser.find_element(By.ID, 'progress')
    browser.get('http://127.0.0.1:5000/admin/export')

    assert browser.current_url == 'http://127.0.0.1:5000/admin/export'

    textarea_text = browser.find_element(By.TAG_NAME, 'textarea').text
    print("export data: \n", textarea_text)

    assert textarea_text.rstrip().endswith(',1,3.0,3')  # Ensure the custom exports work

    browser.get('http://127.0.0.1:5000/admin/table_view/my_task')

    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/my_task'

    table_rows = browser.find_elements(By.TAG_NAME, 'tr')  # Ensure that the table view is working

    assert len(table_rows) >= 1

    print("Admin tests successful!")
    browser.quit()


if __name__ == '__main__':
    bofs_app = threading.Thread(target=start_app)
    bofs_app.start()

    test_client()
    test_admin()
