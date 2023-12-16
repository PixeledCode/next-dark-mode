'use client'

import styles from '../page.module.scss'
import Cookie from 'js-cookie'
import React from 'react'

export const DarkToggle = ({ initialTheme }: { initialTheme: string }) => {
	const [theme, setTheme] = React.useState(initialTheme)

	React.useEffect(() => {
		function themeCheckAndSet(current: string, newTheme: string) {
			if (
				initialTheme === current &&
				window.matchMedia &&
				window.matchMedia(`(prefers-color-scheme: ${newTheme})`).matches
			) {
				setTheme(newTheme)

				Cookie.set('theme-preference', newTheme, {
					expires: 1000,
				})

				document.documentElement.setAttribute('data-theme-color', newTheme)
				return
			}
		}

		if (!Cookie.get('theme-color')) {
			themeCheckAndSet('light', 'dark')
			themeCheckAndSet('dark', 'light')
		}
	}, [initialTheme])

	function handleClick() {
		// get next theme
		const newTheme = theme === 'light' ? 'dark' : 'light'
		// set theme for local state
		setTheme(newTheme)

		// set cookies for next visit
		Cookie.set('theme-color', newTheme, {
			expires: 1000,
		})

		// set theme for html
		document.documentElement.setAttribute('data-theme-color', newTheme)
	}

	return (
		<button onClick={handleClick} className={styles.toggle}>
			Toggle Theme
		</button>
	)
}
