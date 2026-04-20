import React from 'react';
import styles from './dashboard.module.css'
import LoanoutChart from '../../../components/ui/LoanoutChart/LoanoutChart'

const DashboardPage = () => {
    return (
        <div className={styles.dashboard}>
            <h5 style={{ alignSelf: 'flex-start' }}>Hi, Welcome backk!!!</h5>
            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.icon}><i class="fa-solid fa-cloud"></i></div>
                    <div className={styles.item}>
                        <div className={styles.title}>
                            New Items
                        </div>
                        <div className={styles.content}>
                            10
                        </div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.icon}><i class="fa-solid fa-cloud"></i></div>
                    <div className={styles.item}>
                        <div className={styles.title}>
                            New Items
                        </div>
                        <div className={styles.content}>
                            10
                        </div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.icon}><i class="fa-solid fa-cloud"></i></div>
                    <div className={styles.item}>
                        <div className={styles.title}>
                            New Items
                        </div>
                        <div className={styles.content}>
                            10
                        </div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.icon}><i class="fa-solid fa-cloud"></i></div>
                    <div className={styles.item}>
                        <div className={styles.title}>
                            New Items
                        </div>
                        <div className={styles.content}>
                            10
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.overview}>
                <LoanoutChart></LoanoutChart>
            </div>

        </div>
    );
};

export default DashboardPage;