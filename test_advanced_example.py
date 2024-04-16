import os
import threading
import time

from selenium import webdriver
from BOFS.create_app import create_app
from selenium.webdriver import Keys
from selenium.webdriver.common.by import By


def start_app():
    config = "advanced_example/advanced.toml"
    path = os.path.dirname(os.path.abspath(config))

    app = create_app(path, config.split('/')[1], False, False)
    port = 5000  # Default to port 5000 if it's not set.

    app.run('127.0.0.1', port)


def test_client():
    browser = webdriver.Firefox()
    browser.get('http://127.0.0.1:5000/')
    browser.implicitly_wait(.5)

    assert browser.current_url == 'http://127.0.0.1:5000/consent'

    browser.find_element(By.ID, 'consentNo').click()
    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/consent'  # No consent given, so don't redirect

    browser.find_element(By.ID, 'consentYes').click()
    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/external_id'

    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/external_id'

    browser.find_element(By.ID, 'mTurkID').send_keys('test_user')
    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/questionnaire/example'

    browser.find_element(By.ID, 'q_11').click()
    browser.find_element(By.ID, 'q_21').click()
    browser.find_element(By.ID, 'q_31').click()
    browser.find_element(By.ID, 'radiolist_12').click()
    browser.find_element(By.ID, 'cl_2').click()
    browser.find_element(By.ID, 'slider_1').click()
    browser.find_element(By.ID, 'input_1').send_keys('small test')
    browser.find_element(By.ID, 'number_field').send_keys('123abc')
    browser.find_element(By.ID, 'dropdownexample').click()
    browser.find_element(By.ID, 'dropdownexample').send_keys('a')
    browser.find_element(By.ID, 'big').send_keys('big test')
    time.sleep(1)
    browser.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    browser.find_element(By.ID, 'btnNext').click()
    browser.find_element(By.ID, 'number_field').send_keys(Keys.BACKSPACE * 3)
    browser.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/instructions/example_instructions'

    assert '. Put some instructions here.' in browser.page_source

    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/task'

    browser.find_element(By.ID, 'answer').send_keys('windows')
    browser.find_element(By.NAME, 'submit').click()

    assert browser.current_url == 'http://127.0.0.1:5000/task#'

    browser.find_element(By.ID, 'answer').send_keys('linux')
    browser.find_element(By.NAME, 'submit').click()

    assert browser.current_url == 'http://127.0.0.1:5000/questionnaire/grid'

    browser.find_element(By.ID, 'q33').click()
    browser.find_element(By.ID, 'q23').click()
    browser.find_element(By.ID, 'q13').click()
    browser.find_element(By.ID, 'btnNext').click()

    assert browser.current_url == 'http://127.0.0.1:5000/questionnaire/variables'
    assert 'You chose "Maybe" for radiolist_1 on the example questionnaire.' in browser.page_source

    browser.find_element(By.ID, 'special_no').click()
    browser.find_element(By.ID, 'btnNext').click()


    assert browser.current_url == 'http://127.0.0.1:5000/end'
    assert 'Your Completion Code' in browser.page_source

    print("Client tests successful!")
    browser.quit()


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

    assert textarea_text.rstrip().endswith(',2')  # Ensure the custom exports work

    browser.get('http://127.0.0.1:5000/admin/table_view/answers')

    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/answers'

    table_rows = browser.find_elements(By.TAG_NAME, 'tr')  # Ensure that the table view is working

    assert len(table_rows) >= 1

    # Now just view all the other pages and see what happens
    browser.get('http://127.0.0.1:5000/admin/table_view/participant')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/participant'
    assert len(browser.find_elements(By.TAG_NAME, 'tr')) > 0

    browser.get('http://127.0.0.1:5000/admin/table_view/progress')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/progress'
    assert len(browser.find_elements(By.TAG_NAME, 'tr')) > 0

    browser.get('http://127.0.0.1:5000/admin/table_view/questionnaire_example')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/questionnaire_example'
    assert len(browser.find_elements(By.TAG_NAME, 'tr')) > 0

    browser.get('http://127.0.0.1:5000/admin/table_view/questionnaire_grid')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/questionnaire_grid'
    assert len(browser.find_elements(By.TAG_NAME, 'tr')) > 0

    browser.get('http://127.0.0.1:5000/admin/table_view/questionnaire_variables')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/questionnaire_variables'
    assert len(browser.find_elements(By.TAG_NAME, 'tr')) > 0

    browser.get('http://127.0.0.1:5000/admin/table_view/session_store')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/table_view/session_store'
    assert len(browser.find_elements(By.TAG_NAME, 'tr')) > 0

    browser.get('http://127.0.0.1:5000/admin/preview_questionnaire/example')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/preview_questionnaire/example'

    browser.get('http://127.0.0.1:5000/admin/preview_questionnaire/variables')
    assert browser.current_url == 'http://127.0.0.1:5000/admin/preview_questionnaire/variables'
    assert 'Exception in ' not in browser.page_source
    assert 'You chose' in browser.page_source

    print("Admin tests successful!")
    #browser.quit()


if __name__ == '__main__':
    bofs_app = threading.Thread(target=start_app)
    bofs_app.start()

    #test_client()
    test_admin()
