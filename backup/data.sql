--
-- PostgreSQL database dump
--

\restrict yJgd7Fc16XeJUjpItQBLbYrdVOkPQyx1bKsuJ8mgo44fG2DEaNAt2yiTt1Hz3PB

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.schema_migrations VALUES ('20171026211738');
INSERT INTO auth.schema_migrations VALUES ('20171026211808');
INSERT INTO auth.schema_migrations VALUES ('20171026211834');
INSERT INTO auth.schema_migrations VALUES ('20180103212743');
INSERT INTO auth.schema_migrations VALUES ('20180108183307');
INSERT INTO auth.schema_migrations VALUES ('20180119214651');
INSERT INTO auth.schema_migrations VALUES ('20180125194653');
INSERT INTO auth.schema_migrations VALUES ('00');
INSERT INTO auth.schema_migrations VALUES ('20210710035447');
INSERT INTO auth.schema_migrations VALUES ('20210722035447');
INSERT INTO auth.schema_migrations VALUES ('20210730183235');
INSERT INTO auth.schema_migrations VALUES ('20210909172000');
INSERT INTO auth.schema_migrations VALUES ('20210927181326');
INSERT INTO auth.schema_migrations VALUES ('20211122151130');
INSERT INTO auth.schema_migrations VALUES ('20211124214934');
INSERT INTO auth.schema_migrations VALUES ('20211202183645');
INSERT INTO auth.schema_migrations VALUES ('20220114185221');
INSERT INTO auth.schema_migrations VALUES ('20220114185340');
INSERT INTO auth.schema_migrations VALUES ('20220224000811');
INSERT INTO auth.schema_migrations VALUES ('20220323170000');
INSERT INTO auth.schema_migrations VALUES ('20220429102000');
INSERT INTO auth.schema_migrations VALUES ('20220531120530');
INSERT INTO auth.schema_migrations VALUES ('20220614074223');
INSERT INTO auth.schema_migrations VALUES ('20220811173540');
INSERT INTO auth.schema_migrations VALUES ('20221003041349');
INSERT INTO auth.schema_migrations VALUES ('20221003041400');
INSERT INTO auth.schema_migrations VALUES ('20221011041400');
INSERT INTO auth.schema_migrations VALUES ('20221020193600');
INSERT INTO auth.schema_migrations VALUES ('20221021073300');
INSERT INTO auth.schema_migrations VALUES ('20221021082433');
INSERT INTO auth.schema_migrations VALUES ('20221027105023');
INSERT INTO auth.schema_migrations VALUES ('20221114143122');
INSERT INTO auth.schema_migrations VALUES ('20221114143410');
INSERT INTO auth.schema_migrations VALUES ('20221125140132');
INSERT INTO auth.schema_migrations VALUES ('20221208132122');
INSERT INTO auth.schema_migrations VALUES ('20221215195500');
INSERT INTO auth.schema_migrations VALUES ('20221215195800');
INSERT INTO auth.schema_migrations VALUES ('20221215195900');
INSERT INTO auth.schema_migrations VALUES ('20230116124310');
INSERT INTO auth.schema_migrations VALUES ('20230116124412');
INSERT INTO auth.schema_migrations VALUES ('20230131181311');
INSERT INTO auth.schema_migrations VALUES ('20230322519590');
INSERT INTO auth.schema_migrations VALUES ('20230402418590');
INSERT INTO auth.schema_migrations VALUES ('20230411005111');
INSERT INTO auth.schema_migrations VALUES ('20230508135423');
INSERT INTO auth.schema_migrations VALUES ('20230523124323');
INSERT INTO auth.schema_migrations VALUES ('20230818113222');
INSERT INTO auth.schema_migrations VALUES ('20230914180801');
INSERT INTO auth.schema_migrations VALUES ('20231027141322');
INSERT INTO auth.schema_migrations VALUES ('20231114161723');
INSERT INTO auth.schema_migrations VALUES ('20231117164230');
INSERT INTO auth.schema_migrations VALUES ('20240115144230');
INSERT INTO auth.schema_migrations VALUES ('20240214120130');
INSERT INTO auth.schema_migrations VALUES ('20240306115329');
INSERT INTO auth.schema_migrations VALUES ('20240314092811');
INSERT INTO auth.schema_migrations VALUES ('20240427152123');
INSERT INTO auth.schema_migrations VALUES ('20240612123726');
INSERT INTO auth.schema_migrations VALUES ('20240729123726');
INSERT INTO auth.schema_migrations VALUES ('20240802193726');
INSERT INTO auth.schema_migrations VALUES ('20240806073726');
INSERT INTO auth.schema_migrations VALUES ('20241009103726');
INSERT INTO auth.schema_migrations VALUES ('20250717082212');
INSERT INTO auth.schema_migrations VALUES ('20250731150234');
INSERT INTO auth.schema_migrations VALUES ('20250804100000');
INSERT INTO auth.schema_migrations VALUES ('20250901200500');
INSERT INTO auth.schema_migrations VALUES ('20250903112500');
INSERT INTO auth.schema_migrations VALUES ('20250904133000');
INSERT INTO auth.schema_migrations VALUES ('20250925093508');
INSERT INTO auth.schema_migrations VALUES ('20251007112900');
INSERT INTO auth.schema_migrations VALUES ('20251104100000');
INSERT INTO auth.schema_migrations VALUES ('20251111201300');
INSERT INTO auth.schema_migrations VALUES ('20251201000000');
INSERT INTO auth.schema_migrations VALUES ('20260115000000');
INSERT INTO auth.schema_migrations VALUES ('20260121000000');
INSERT INTO auth.schema_migrations VALUES ('20260219120000');
INSERT INTO auth.schema_migrations VALUES ('20260302000000');


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories VALUES (6, 'Stationary(សម្ភារះការិយាល័យ)', NULL, '2026-05-01 06:48:34.841941+00', '2026-05-01 06:48:34.841941+00');
INSERT INTO public.categories VALUES (7, 'Tape(ស្គុត)', NULL, '2026-05-01 06:50:39.29919+00', '2026-05-01 06:50:39.29919+00');
INSERT INTO public.categories VALUES (9, 'សម្ភារះតុកាត់', NULL, '2026-05-01 06:51:39.654227+00', '2026-05-01 06:51:39.654227+00');
INSERT INTO public.categories VALUES (10, 'សម្ភារះអ៊ុត', NULL, '2026-05-01 06:52:09.830092+00', '2026-05-01 06:52:09.830092+00');
INSERT INTO public.categories VALUES (11, 'សម្ភារះជាងភ្លើង', NULL, '2026-05-01 06:52:51.093083+00', '2026-05-01 06:52:51.093083+00');
INSERT INTO public.categories VALUES (12, 'ម្ចុល', NULL, '2026-05-01 06:53:10.690323+00', '2026-05-01 06:53:10.690323+00');
INSERT INTO public.categories VALUES (13, 'ជើងទា', NULL, '2026-05-01 06:53:32.153708+00', '2026-05-01 06:53:32.153708+00');
INSERT INTO public.categories VALUES (14, 'Cleaning (សម្ភារះសំអាត)', NULL, '2026-05-01 06:54:06.604333+00', '2026-05-01 06:54:06.604333+00');
INSERT INTO public.categories VALUES (15, 'Report(បុងអីវ៉ាន់)', NULL, '2026-05-01 06:54:41.328698+00', '2026-05-01 06:54:41.328698+00');
INSERT INTO public.categories VALUES (8, 'ដីសនិងផ្សេងៗ', NULL, '2026-05-01 06:51:12.250105+00', '2026-05-04 08:37:14.016+00');


--
-- Data for Name: workers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workers VALUES (6, '00057', 'មាស សុធា', 'ប្រធានក្រុម4', 'Line 04', true, '2026-05-01 06:57:30.243814+00', '2026-05-01 06:57:30.243814+00');
INSERT INTO public.workers VALUES (7, '00475', 'វ៉ាន់ ស៊ីណេត', 'ប្រធានក្រុម5', 'Line 05', true, '2026-05-01 06:59:20.64092+00', '2026-05-01 06:59:20.64092+00');
INSERT INTO public.workers VALUES (8, '00530', 'ស៊ាង ស្រីម៉ៅ', 'Supervisor大组长', 'Supervisor', true, '2026-05-01 06:59:52.546103+00', '2026-05-01 06:59:52.546103+00');
INSERT INTO public.workers VALUES (9, '01133', 'ឆឹម សំបើម', 'ប្រធានក្រុម3', 'Line 03', true, '2026-05-01 07:00:25.009275+00', '2026-05-01 07:00:25.009275+00');
INSERT INTO public.workers VALUES (11, 'ZJL300', 'យឿន បក្សភា', 'ប្រធានក្រុម02', 'Line 02', true, '2026-05-01 07:01:47.145092+00', '2026-05-01 07:01:47.145092+00');
INSERT INTO public.workers VALUES (10, 'ZJL249', 'ខាត់ វណ្ណះ', 'ប្រធានក្រុម01', 'Line01', true, '2026-05-01 07:01:07.352403+00', '2026-05-01 13:14:59.658+00');


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.loans VALUES (9, '2026050506582', 8, '2026-05-05', NULL, NULL, 'OPEN', 'ខ្ចីA5(St3153-701)', '2026-05-05 06:58:24.649737+00', '2026-05-05 06:58:24.649737+00');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products VALUES (63, '0040', 'ស្គុតថ្លា5cm', 7, 'Office', 0.50, true, '2026-05-04 05:28:26.592076+00', '2026-05-04 05:28:26.592076+00', NULL);
INSERT INTO public.products VALUES (64, '0041', 'ស្គុតថ្លា6cm', 7, 'Production', 0.50, true, '2026-05-04 05:29:13.551458+00', '2026-05-04 05:29:13.551458+00', NULL);
INSERT INTO public.products VALUES (65, '0042', 'ស្គុតពុម្ពក្រហម', 7, 'Production', 0.70, true, '2026-05-04 05:30:02.869397+00', '2026-05-04 05:30:02.869397+00', NULL);
INSERT INTO public.products VALUES (66, '0043', 'ម្សៅឆា', 8, 'Production', 1.00, true, '2026-05-04 05:31:09.043934+00', '2026-05-04 05:31:09.043934+00', NULL);
INSERT INTO public.products VALUES (24, '0001', 'ទឹកលុប', 6, 'Office', 0.37, true, '2026-05-02 05:43:09.369603+00', '2026-05-04 03:09:36.444+00', NULL);
INSERT INTO public.products VALUES (25, '0002', 'សាមីក្រដាស', 6, 'Office', 0.25, true, '2026-05-04 03:10:38.987135+00', '2026-05-04 03:10:38.987135+00', NULL);
INSERT INTO public.products VALUES (26, '0003', 'Paper Fastaner(ប្រដាប់សៀតសាមីក្រដាស)', 6, 'Office', 0.20, true, '2026-05-04 03:13:52.589567+00', '2026-05-04 03:13:52.589567+00', NULL);
INSERT INTO public.products VALUES (27, '0004', 'សៀវភៅធំ', 6, 'Office', 1.50, true, '2026-05-04 03:14:47.562866+00', '2026-05-04 03:14:47.562866+00', NULL);
INSERT INTO public.products VALUES (28, '0005', 'សៀវភៅតូច', 6, 'Office', 0.50, true, '2026-05-04 03:15:24.464739+00', '2026-05-04 03:15:24.464739+00', NULL);
INSERT INTO public.products VALUES (29, '0006', 'តាំប៉ុង ខៀវ', 6, 'Office', 2.00, true, '2026-05-04 03:16:38.681722+00', '2026-05-04 03:16:38.681722+00', NULL);
INSERT INTO public.products VALUES (30, '0007', 'តាំប៉ុង ក្រហម', 6, 'Office', 2.00, true, '2026-05-04 03:17:13.166046+00', '2026-05-04 03:17:13.166046+00', NULL);
INSERT INTO public.products VALUES (31, '0008', 'ដែកចាក់', 12, 'Production', 0.50, true, '2026-05-04 03:18:18.697475+00', '2026-05-04 03:18:18.697475+00', NULL);
INSERT INTO public.products VALUES (33, '0010', 'ប្រដាប់ចោះក្រដាស', 6, 'Office', 2.50, true, '2026-05-04 03:21:00.074929+00', '2026-05-04 03:21:00.074929+00', NULL);
INSERT INTO public.products VALUES (34, '0011', 'គ្រាប់កិបតូច', 6, 'Office', 0.50, true, '2026-05-04 03:21:41.681557+00', '2026-05-04 03:21:41.681557+00', NULL);
INSERT INTO public.products VALUES (35, '0012', 'គ្រាប់កិបធំ', 6, 'Office', 0.50, true, '2026-05-04 03:22:11.76605+00', '2026-05-04 03:22:29.659+00', NULL);
INSERT INTO public.products VALUES (36, '0013', 'ឃ្នាបក្រដាស់(51mm)', 6, 'Office', 0.25, true, '2026-05-04 03:24:37.712109+00', '2026-05-04 03:24:37.712109+00', NULL);
INSERT INTO public.products VALUES (37, '0014', 'ឃ្នាបក្រដាស(32mm)', 6, 'Office', 0.25, true, '2026-05-04 03:25:24.921683+00', '2026-05-04 03:25:24.921683+00', NULL);
INSERT INTO public.products VALUES (38, '0015', 'ឃ្នាបក្រដាស(25mm)', 6, 'Office', 0.25, true, '2026-05-04 03:25:56.03044+00', '2026-05-04 03:25:56.03044+00', NULL);
INSERT INTO public.products VALUES (39, '0016', 'Round paper Clip', 6, 'Office', 0.50, true, '2026-05-04 03:26:59.450899+00', '2026-05-04 03:26:59.450899+00', NULL);
INSERT INTO public.products VALUES (40, '0017', 'ខ្មៅដៃ', 6, 'Production', 0.25, true, '2026-05-04 03:27:39.060442+00', '2026-05-04 03:27:53.085+00', NULL);
INSERT INTO public.products VALUES (41, '0018', 'ដែកខួង', 6, 'Office', 0.25, true, '2026-05-04 03:28:58.488226+00', '2026-05-04 03:28:58.488226+00', NULL);
INSERT INTO public.products VALUES (42, '0019', 'ខ្មៅដៃចុច', 6, 'Office', 1.00, true, '2026-05-04 03:29:35.393903+00', '2026-05-04 03:29:35.393903+00', NULL);
INSERT INTO public.products VALUES (43, '0020', 'ប៊ិកលុបបាន(ពណ៌ខៀវ)', 6, 'Office', 0.50, true, '2026-05-04 03:30:32.055733+00', '2026-05-04 03:30:32.055733+00', NULL);
INSERT INTO public.products VALUES (44, '0021', 'របាយការណ៍បើកអីវ៉ាន់', 15, 'OTHER', 0.50, true, '2026-05-04 03:31:38.176285+00', '2026-05-04 03:31:38.176285+00', NULL);
INSERT INTO public.products VALUES (45, '0022', 'របាយការណ៍អូសក្រណាត់', 15, 'OTHER', 0.50, true, '2026-05-04 03:32:14.119691+00', '2026-05-04 03:32:14.119691+00', NULL);
INSERT INTO public.products VALUES (46, '0023', 'បណ្តូលខ្មៅដៃ', 6, 'Office', 0.50, true, '2026-05-04 03:33:17.154504+00', '2026-05-04 03:33:17.154504+00', NULL);
INSERT INTO public.products VALUES (47, '0024', 'ហាយឡាយពណ៌', 6, 'Office', 0.25, true, '2026-05-04 03:35:52.789028+00', '2026-05-04 03:35:52.789028+00', NULL);
INSERT INTO public.products VALUES (48, '0025', 'ជ័រលុប', 6, 'Office', 0.13, true, '2026-05-04 03:37:50.40493+00', '2026-05-04 03:37:50.40493+00', NULL);
INSERT INTO public.products VALUES (49, '0026', 'ហ្វឺតខៀវលុបអត់បាន', 6, 'Carton', 0.25, true, '2026-05-04 03:38:55.558784+00', '2026-05-04 03:38:55.558784+00', NULL);
INSERT INTO public.products VALUES (50, '0027', 'ហ្វឺតខ្មៅលុបអត់បាន', 6, 'Carton', 0.25, true, '2026-05-04 03:39:34.854856+00', '2026-05-04 03:39:34.854856+00', NULL);
INSERT INTO public.products VALUES (51, '0028', 'ហ្វឺតក្តាខៀន(ពណ៌ខៀវ)', 6, 'Production', 0.25, true, '2026-05-04 03:40:33.279146+00', '2026-05-04 03:40:33.279146+00', NULL);
INSERT INTO public.products VALUES (52, '0029', 'ហ្វឺតក្តាខៀន(ពណ៌ក្រហម)', 6, 'Production', 0.25, true, '2026-05-04 03:41:17.098967+00', '2026-05-04 03:41:17.098967+00', NULL);
INSERT INTO public.products VALUES (53, '0030', 'ហ្វឺត3D', 6, 'Production', 0.25, true, '2026-05-04 03:42:41.552563+00', '2026-05-04 03:42:41.552563+00', NULL);
INSERT INTO public.products VALUES (54, '0031', 'ប៊ិកខៀវ', 6, 'Office', 0.25, true, '2026-05-04 05:16:25.661521+00', '2026-05-04 05:16:25.661521+00', NULL);
INSERT INTO public.products VALUES (55, '0032', 'ប៊ិកក្រហម', 6, 'Office', 0.25, true, '2026-05-04 05:17:01.606843+00', '2026-05-04 05:17:01.606843+00', NULL);
INSERT INTO public.products VALUES (57, '0034', 'ដៃស្គុត7cm', 7, 'Carton', 2.50, true, '2026-05-04 05:18:59.324613+00', '2026-05-04 05:18:59.324613+00', NULL);
INSERT INTO public.products VALUES (56, '0033', 'ដៃស្គុត5cm', 7, 'Carton', 2.50, true, '2026-05-04 05:18:11.046369+00', '2026-05-04 05:19:08.475+00', NULL);
INSERT INTO public.products VALUES (58, '0035', 'ស្គុតក្រដាស់តូច', 7, 'Cutting', 0.50, true, '2026-05-04 05:20:57.354292+00', '2026-05-04 05:20:57.354292+00', NULL);
INSERT INTO public.products VALUES (59, '0036', 'ស្គុតក្រដាសធំ', 7, 'Cutting', 0.50, true, '2026-05-04 05:21:55.466425+00', '2026-05-04 05:21:55.466425+00', NULL);
INSERT INTO public.products VALUES (60, '0037', 'ស្គុតមុខពីរ', 7, 'Production', 0.20, true, '2026-05-04 05:23:03.503225+00', '2026-05-04 05:23:03.503225+00', NULL);
INSERT INTO public.products VALUES (61, '0038', 'ស្គុតពុម្ពស', 7, 'Production', 0.50, true, '2026-05-04 05:24:39.783554+00', '2026-05-04 05:24:39.783554+00', NULL);
INSERT INTO public.products VALUES (62, '0039', 'ស្គុតថ្លា2cm', 7, 'Production', 0.50, true, '2026-05-04 05:25:30.856008+00', '2026-05-04 05:25:30.856008+00', NULL);
INSERT INTO public.products VALUES (67, '0044', 'ដីស(ពណ៌ចំរុះ)', 8, 'Production', 1.20, true, '2026-05-04 05:32:11.262345+00', '2026-05-04 05:33:10.544+00', NULL);
INSERT INTO public.products VALUES (70, '0047', 'ដីសដើម', 8, 'Production', 1.20, true, '2026-05-04 05:34:38.008352+00', '2026-05-04 05:34:38.008352+00', NULL);
INSERT INTO public.products VALUES (71, '0048', 'ត្របៀតចាប់អំបោះ', 12, 'Production', 0.70, true, '2026-05-04 05:35:31.111507+00', '2026-05-04 05:35:31.111507+00', NULL);
INSERT INTO public.products VALUES (72, '0049', 'កៅស៊ូកង', 8, 'Production', 2.50, true, '2026-05-04 05:36:50.031606+00', '2026-05-04 05:36:50.031606+00', NULL);
INSERT INTO public.products VALUES (73, '0050', 'ម្សៅភេសាត់', 8, 'Production', 2.50, true, '2026-05-04 05:37:30.369224+00', '2026-05-04 05:37:30.369224+00', NULL);
INSERT INTO public.products VALUES (74, '0051', 'ព្រួញ', 8, 'Production', 2.50, true, '2026-05-04 05:38:06.370786+00', '2026-05-04 05:38:06.370786+00', NULL);
INSERT INTO public.products VALUES (75, '0052', 'កាំបិតកាត់លេខ10អ៊ីង', 9, 'Production', 2.50, true, '2026-05-04 05:39:10.097847+00', '2026-05-04 05:39:10.097847+00', NULL);
INSERT INTO public.products VALUES (76, '0053', 'ខ្សែពានសំលៀង', 9, 'Production', 3.00, true, '2026-05-04 05:39:41.672237+00', '2026-05-04 05:39:41.672237+00', NULL);
INSERT INTO public.products VALUES (77, '0054', 'ស្រោមដៃដែក', 9, 'Production', 2.00, true, '2026-05-04 05:40:12.81878+00', '2026-05-04 05:40:12.81878+00', NULL);
INSERT INTO public.products VALUES (78, '0055', 'ស្រ្បៃបាញ់ប្រឡាក់(ខៀវ)', 8, 'Production', 2.50, true, '2026-05-04 05:41:17.231242+00', '2026-05-04 05:41:17.231242+00', NULL);
INSERT INTO public.products VALUES (79, '0056', 'ស្ប្រៃបាញ់ប្រឡាក់(ពណ៌ក្រហម)', 8, 'Production', 2.50, true, '2026-05-04 05:42:02.079851+00', '2026-05-04 05:42:02.079851+00', NULL);
INSERT INTO public.products VALUES (80, '0057', 'ទឹកថ្នាំ(Marker)', 9, 'Production', 2.50, true, '2026-05-04 05:43:04.956493+00', '2026-05-04 05:43:04.956493+00', NULL);
INSERT INTO public.products VALUES (81, '0058', 'ម្សៅ183', 9, 'Production', 1.00, true, '2026-05-04 05:43:40.861282+00', '2026-05-04 05:43:40.861282+00', NULL);
INSERT INTO public.products VALUES (82, '0059', 'ទឹកច្រេះ', 8, 'Production', 2.00, true, '2026-05-04 05:44:14.263211+00', '2026-05-04 05:44:14.263211+00', NULL);
INSERT INTO public.products VALUES (83, '0060', 'កាវ502', 8, 'Production', 0.60, true, '2026-05-04 05:45:09.818059+00', '2026-05-04 05:45:09.818059+00', NULL);
INSERT INTO public.products VALUES (84, '0061', 'ប្រេងចាក់អំបោះ', 8, 'Production', 2.50, true, '2026-05-04 05:45:45.382378+00', '2026-05-04 05:45:45.382378+00', NULL);
INSERT INTO public.products VALUES (85, '0062', 'អំបោស', 14, 'OTHER', 1.75, true, '2026-05-04 07:56:51.211213+00', '2026-05-04 07:56:51.211213+00', NULL);
INSERT INTO public.products VALUES (86, '0063', 'អំបោសជ័រដងវែង', 14, 'OTHER', 1.75, true, '2026-05-04 07:57:26.504753+00', '2026-05-04 07:57:26.504753+00', NULL);
INSERT INTO public.products VALUES (87, '0064', 'ប្រដាប់ចូកសំរាម', 14, 'OTHER', 1.75, true, '2026-05-04 07:58:03.369897+00', '2026-05-04 07:58:03.369897+00', NULL);
INSERT INTO public.products VALUES (88, '0065', 'អូសាវែ', 14, 'OTHER', 1.50, true, '2026-05-04 07:58:51.76389+00', '2026-05-04 07:58:51.76389+00', NULL);
INSERT INTO public.products VALUES (69, '0046', 'ដីសទៀន(រូបទន្សាយ)', 8, 'Production', 3.30, true, '2026-05-04 05:33:57.355661+00', '2026-05-06 10:55:09.667+00', NULL);
INSERT INTO public.products VALUES (89, '0066', 'សាប៊ូដុំ', 14, 'OTHER', 0.50, true, '2026-05-04 07:59:19.441968+00', '2026-05-04 07:59:19.441968+00', NULL);
INSERT INTO public.products VALUES (90, '0067', 'DB*1=9', 12, 'Production', 0.00, true, '2026-05-04 08:00:02.083397+00', '2026-05-04 08:00:02.083397+00', NULL);
INSERT INTO public.products VALUES (91, '0068', 'DB*1=11', 12, 'Production', 0.00, true, '2026-05-04 08:00:33.66256+00', '2026-05-04 08:00:33.66256+00', NULL);
INSERT INTO public.products VALUES (92, '0069', 'DB*1=12', 12, 'Production', 0.00, true, '2026-05-04 08:01:05.552514+00', '2026-05-04 08:01:05.552514+00', NULL);
INSERT INTO public.products VALUES (93, '0070', 'DB*1=14', 12, 'Production', 0.00, true, '2026-05-04 08:01:37.847966+00', '2026-05-04 08:01:37.847966+00', NULL);
INSERT INTO public.products VALUES (94, '0071', 'DB*1=16', 12, 'Production', 0.00, true, '2026-05-04 08:02:05.755749+00', '2026-05-04 08:02:05.755749+00', NULL);
INSERT INTO public.products VALUES (95, '0072', 'DP*5=9', 12, 'Production', 0.00, true, '2026-05-04 08:02:32.370549+00', '2026-05-04 08:02:32.370549+00', NULL);
INSERT INTO public.products VALUES (96, '0073', 'DP*5=10', 12, 'Production', 0.00, true, '2026-05-04 08:03:13.142154+00', '2026-05-04 08:03:13.142154+00', NULL);
INSERT INTO public.products VALUES (98, '0075', 'DP*5=12', 12, 'Production', 0.00, true, '2026-05-04 08:04:17.968981+00', '2026-05-04 08:04:17.968981+00', NULL);
INSERT INTO public.products VALUES (99, '0076', 'DP*5=13', 12, 'Production', 0.00, true, '2026-05-04 08:04:47.427891+00', '2026-05-04 08:04:47.427891+00', NULL);
INSERT INTO public.products VALUES (100, '0077', 'DP*5=16', 12, 'Production', 0.00, true, '2026-05-04 08:06:01.014957+00', '2026-05-04 08:06:01.014957+00', NULL);
INSERT INTO public.products VALUES (101, '0078', 'DP*17=9', 12, 'Production', 0.00, true, '2026-05-04 08:06:29.035393+00', '2026-05-04 08:06:29.035393+00', NULL);
INSERT INTO public.products VALUES (102, '0079', 'DP*17=11', 12, 'Production', 0.00, true, '2026-05-04 08:07:01.293599+00', '2026-05-04 08:07:01.293599+00', NULL);
INSERT INTO public.products VALUES (103, '0080', 'DP*17=12', 12, 'Production', 0.00, true, '2026-05-04 08:07:32.39901+00', '2026-05-04 08:07:32.39901+00', NULL);
INSERT INTO public.products VALUES (105, '0082', 'DP*17=14', 12, 'Production', 0.00, true, '2026-05-04 08:08:29.045369+00', '2026-05-04 08:08:29.045369+00', NULL);
INSERT INTO public.products VALUES (106, '0083', 'DC*1=9', 12, 'Production', 0.00, true, '2026-05-04 08:08:49.52447+00', '2026-05-04 08:08:49.52447+00', NULL);
INSERT INTO public.products VALUES (107, '0084', 'DC*1=11', 12, 'Production', 0.00, true, '2026-05-04 08:09:24.492848+00', '2026-05-04 08:09:24.492848+00', NULL);
INSERT INTO public.products VALUES (108, '0085', 'DC*1=12', 12, 'Production', 0.00, true, '2026-05-04 08:09:58.302238+00', '2026-05-04 08:09:58.302238+00', NULL);
INSERT INTO public.products VALUES (109, '0086', 'DC*1=13', 12, 'Production', 0.00, true, '2026-05-04 08:10:23.564757+00', '2026-05-04 08:10:23.564757+00', NULL);
INSERT INTO public.products VALUES (110, '0087', 'UY*128=9', 12, 'Production', 0.00, true, '2026-05-04 08:10:50.613245+00', '2026-05-04 08:10:50.613245+00', NULL);
INSERT INTO public.products VALUES (111, '0088', 'UY*128=11', 12, 'Production', 0.00, true, '2026-05-04 08:11:19.788801+00', '2026-05-04 08:11:19.788801+00', NULL);
INSERT INTO public.products VALUES (112, '0089', 'UY*128=12', 12, 'Production', 0.00, true, '2026-05-04 08:11:36.803759+00', '2026-05-04 08:11:36.803759+00', NULL);
INSERT INTO public.products VALUES (113, '0090', 'UY*128=13', 12, 'Production', 0.00, true, '2026-05-04 08:11:55.386652+00', '2026-05-04 08:11:55.386652+00', NULL);
INSERT INTO public.products VALUES (114, '0091', 'UY*128=14', 12, 'Production', 0.00, true, '2026-05-04 08:12:14.555734+00', '2026-05-04 08:12:14.555734+00', NULL);
INSERT INTO public.products VALUES (115, '0092', 'LW*6T=9', 12, 'Production', 0.00, true, '2026-05-04 08:12:51.549341+00', '2026-05-04 08:12:51.549341+00', NULL);
INSERT INTO public.products VALUES (116, '0093', 'LW*6T=11', 12, 'Production', 0.00, true, '2026-05-04 08:13:17.413476+00', '2026-05-04 08:13:17.413476+00', NULL);
INSERT INTO public.products VALUES (117, '0094', 'LW*6T=12', 12, 'Production', 0.00, true, '2026-05-04 08:13:40.611683+00', '2026-05-04 08:13:40.611683+00', NULL);
INSERT INTO public.products VALUES (118, '0095', 'LW*6T=13', 12, 'Production', 0.00, true, '2026-05-04 08:13:57.632878+00', '2026-05-04 08:13:57.632878+00', NULL);
INSERT INTO public.products VALUES (119, '0096', 'LW*6T=14', 12, 'Production', 0.00, true, '2026-05-04 08:14:15.979129+00', '2026-05-04 08:14:15.979129+00', NULL);
INSERT INTO public.products VALUES (120, '0097', 'UO=12', 12, 'Production', 0.00, true, '2026-05-04 08:14:47.882043+00', '2026-05-04 08:14:47.882043+00', NULL);
INSERT INTO public.products VALUES (121, '0098', 'DO*558=16', 12, 'Production', 0.00, true, '2026-05-04 08:15:20.284512+00', '2026-05-04 08:15:20.284512+00', NULL);
INSERT INTO public.products VALUES (122, '0099', 'MT*150=14', 12, 'Production', 0.00, true, '2026-05-04 08:15:57.343269+00', '2026-05-04 08:15:57.343269+00', NULL);
INSERT INTO public.products VALUES (124, '0101', 'DV*57=10', 12, 'Production', 0.00, true, '2026-05-04 08:16:44.89156+00', '2026-05-04 08:16:44.89156+00', NULL);
INSERT INTO public.products VALUES (123, '0100', 'MT*150=16', 12, 'Production', 0.00, true, '2026-05-04 08:16:13.202519+00', '2026-05-04 08:16:52.899+00', NULL);
INSERT INTO public.products VALUES (125, '0102', 'DV*57=18', 12, 'Production', 0.00, true, '2026-05-04 08:17:17.496248+00', '2026-05-04 08:17:17.496248+00', NULL);
INSERT INTO public.products VALUES (126, '0103', 'បាតឆ្នាំអ៊ុតតូច(85)', 10, 'Production', 0.00, true, '2026-05-04 08:18:12.157549+00', '2026-05-04 08:18:12.157549+00', NULL);
INSERT INTO public.products VALUES (127, '0104', 'បាតឆ្នាំអ៊ុតធំ(60)', 10, 'Production', 0.00, true, '2026-05-04 08:19:24.363359+00', '2026-05-04 08:19:24.363359+00', NULL);
INSERT INTO public.products VALUES (129, '0106', 'ខ្សែរឆ្នាំងអ៊ុត5M', 10, 'Production', 0.00, true, '2026-05-04 08:20:31.127605+00', '2026-05-04 08:20:31.127605+00', NULL);
INSERT INTO public.products VALUES (128, '0105', 'ខ្សែឆ្នាំងអ៊ុត3M', 10, 'Production', 0.00, true, '2026-05-04 08:19:53.246941+00', '2026-05-04 08:20:40.624+00', NULL);
INSERT INTO public.products VALUES (131, '0108', 'ជើងទាជ័រម៉ាលីធ្វេង (TCL 1/16N)', 13, 'Production', 0.30, true, '2026-05-04 08:22:32.471037+00', '2026-05-04 08:22:32.471037+00', NULL);
INSERT INTO public.products VALUES (132, '0109', 'ជើងទាជ័រម៉ាលីស្តាំ (TCR 1/16N)', 13, 'Production', 0.30, true, '2026-05-04 08:22:58.950445+00', '2026-05-04 08:22:58.950445+00', NULL);
INSERT INTO public.products VALUES (133, '0110', 'ជើងទាម៉ាលីធ្វេង (CL 1/16N)', 13, 'Production', 0.55, true, '2026-05-04 08:23:24.154337+00', '2026-05-04 08:23:24.154337+00', NULL);
INSERT INTO public.products VALUES (134, '0111', 'ជើងទាម៉ាលីស្តាំ (CR 1/16N)', 13, 'Production', 0.55, true, '2026-05-04 08:23:51.480283+00', '2026-05-04 08:23:51.480283+00', NULL);
INSERT INTO public.products VALUES (135, '0112', 'ជើងទាស្មើ (P351)', 13, 'Production', 0.55, true, '2026-05-04 08:24:14.166262+00', '2026-05-04 08:24:14.166262+00', NULL);
INSERT INTO public.products VALUES (136, '0113', 'ជើងកងជ័រស្មើ(T35)', 13, 'Production', 0.70, true, '2026-05-04 08:25:08.401127+00', '2026-05-04 08:25:08.401127+00', NULL);
INSERT INTO public.products VALUES (137, '0114', 'ជើងទាកងម៉ាលីធ្វេង (TCL 1/32N)', 13, 'Production', 0.70, true, '2026-05-04 08:25:33.828544+00', '2026-05-04 08:25:33.828544+00', NULL);
INSERT INTO public.products VALUES (138, '0115', 'ជើងទាកងម៉ាលីស្តាំ (TCR 1/16N)', 13, 'Production', 0.70, true, '2026-05-04 08:26:07.028825+00', '2026-05-04 08:26:07.028825+00', NULL);
INSERT INTO public.products VALUES (139, '0116', 'ជើងទាដេររ៉ូត(P363)', 13, 'Production', 0.45, true, '2026-05-04 08:26:41.618258+00', '2026-05-04 08:26:41.618258+00', NULL);
INSERT INTO public.products VALUES (142, '0117', 'ជើងទាដេររ៉ូត(P361)', 13, 'Production', 0.45, true, '2026-05-04 08:27:47.582247+00', '2026-05-04 08:27:47.582247+00', NULL);
INSERT INTO public.products VALUES (143, '0118', 'ជើងទាដេររ៉ូត(P360)', 13, 'Production', 0.45, true, '2026-05-04 08:28:07.569454+00', '2026-05-04 08:28:07.569454+00', NULL);
INSERT INTO public.products VALUES (144, '0119', 'ជើងទាដេររ៉ូតម្ខាងស្តាំ (P36N)', 13, 'Production', 0.45, true, '2026-05-04 08:28:32.946681+00', '2026-05-04 08:28:32.946681+00', NULL);
INSERT INTO public.products VALUES (145, '0120', 'ជើងទាដេររ៉ូតម្ខាងធ្វេង (P36LN)', 13, 'Production', 0.45, true, '2026-05-04 08:28:56.887613+00', '2026-05-04 08:28:56.887613+00', NULL);
INSERT INTO public.products VALUES (146, '0121', 'ជើងទាបញ្ជ្រួញ(P952)', 13, 'Production', 0.00, true, '2026-05-04 08:29:32.620437+00', '2026-05-04 08:29:32.620437+00', NULL);
INSERT INTO public.products VALUES (147, '0122', 'ជើងទាបញ្ជ្រួញខ្ចៅកណ្តាល (P952)', 13, 'Production', 1.00, true, '2026-05-04 08:30:00.032717+00', '2026-05-04 08:30:00.032717+00', NULL);
INSERT INTO public.products VALUES (148, '0123', 'ជើងទា(SP-705 1/32)', 13, 'Production', 1.45, true, '2026-05-04 08:30:45.345968+00', '2026-05-04 08:30:45.345968+00', NULL);
INSERT INTO public.products VALUES (149, '0124', 'ជើងទា (12463HR 1/16)', 13, 'Production', 0.00, true, '2026-05-04 08:31:27.177039+00', '2026-05-04 08:31:27.177039+00', NULL);
INSERT INTO public.products VALUES (150, '0125', 'ជើងទា (12463HR 1/8)', 13, 'Production', 0.00, true, '2026-05-04 08:31:47.308192+00', '2026-05-04 08:31:47.308192+00', NULL);
INSERT INTO public.products VALUES (151, '0126', 'ជើងទា (12463HR 1/4)', 13, 'Production', 0.80, true, '2026-05-04 08:32:11.787781+00', '2026-05-04 08:32:11.787781+00', NULL);
INSERT INTO public.products VALUES (152, '0127', 'ជើងទា (NR-315)', 13, 'Production', 0.00, true, '2026-05-04 08:33:03.984461+00', '2026-05-04 08:33:03.984461+00', NULL);
INSERT INTO public.products VALUES (153, '0128', 'ជើងទាទូកដែក', 13, 'Production', 0.00, true, '2026-05-04 08:33:29.685229+00', '2026-05-04 08:33:29.685229+00', NULL);
INSERT INTO public.products VALUES (155, '0129', 'ជើងទាទូកជ័រ', 13, 'Production', 0.00, true, '2026-05-04 08:34:03.324237+00', '2026-05-04 08:34:03.324237+00', NULL);
INSERT INTO public.products VALUES (157, '0130', 'ជើងទា(P5Q)', 13, 'Production', 0.00, true, '2026-05-04 08:34:39.485513+00', '2026-05-04 08:34:39.485513+00', NULL);
INSERT INTO public.products VALUES (158, '0131', 'ជើងទាកង់ជ័រ', 13, 'Production', 0.00, true, '2026-05-04 08:35:12.900219+00', '2026-05-04 08:35:12.900219+00', NULL);
INSERT INTO public.products VALUES (159, '0132', 'សាំងគួយ', 13, 'Production', 0.60, true, '2026-05-04 08:35:39.584256+00', '2026-05-04 08:35:39.584256+00', NULL);
INSERT INTO public.products VALUES (160, '0133', 'ត្រល់', 13, 'Production', 0.00, true, '2026-05-05 06:52:50.069229+00', '2026-05-05 06:52:50.069229+00', NULL);
INSERT INTO public.products VALUES (161, '0134', 'សោគារ', 13, 'Production', 0.00, true, '2026-05-05 06:53:16.797884+00', '2026-05-05 06:53:16.797884+00', NULL);
INSERT INTO public.products VALUES (162, '0135', 'សំបុកម្ជុល1', 13, 'Production', 0.00, true, '2026-05-05 06:53:46.139964+00', '2026-05-05 06:53:46.139964+00', NULL);
INSERT INTO public.products VALUES (163, '0136', 'ត្រល់ម្ជុលពីរសោគា', 13, 'Production', 0.00, true, '2026-05-05 06:54:34.568234+00', '2026-05-05 06:54:34.568234+00', NULL);
INSERT INTO public.products VALUES (97, '0074', 'DP*5=11', 12, 'Production', 0.76, true, '2026-05-04 08:03:44.084281+00', '2026-05-06 10:54:10.675+00', NULL);
INSERT INTO public.products VALUES (130, '0107', 'ជើងទាជ័រស្មើ(MT-18)', 13, 'Production', 0.30, true, '2026-05-04 08:22:04.57366+00', '2026-05-06 10:55:44.957+00', NULL);
INSERT INTO public.products VALUES (104, '0081', 'DP*17=13', 12, 'Production', 1.33, true, '2026-05-04 08:08:06.657287+00', '2026-05-06 10:53:48.588+00', NULL);
INSERT INTO public.products VALUES (32, '0009', 'កន្រ្តៃតូច(កាត់ព្រុយ)', 12, 'Production', 2.40, true, '2026-05-04 03:20:07.782319+00', '2026-05-06 10:54:32.683+00', NULL);
INSERT INTO public.products VALUES (68, '0045', 'ដីស(ពណ៌ស)', 8, 'Production', 1.20, true, '2026-05-04 05:33:03.87742+00', '2026-05-07 05:32:27.045+00', 'https://iwvopkjhvuxyspirxqrc.supabase.co/storage/v1/object/public/product-images/products/68/1778131946572.jpg');


--
-- Data for Name: loan_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.loan_items VALUES (9, 9, 163, 5, 0, 'OPEN', NULL, '2026-05-05 06:58:24.954339+00', '2026-05-05 06:58:24.954339+00');


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stock_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.stock_balances VALUES (98, 108, 400, 0, '2026-05-04 08:09:58.496617+00');
INSERT INTO public.stock_balances VALUES (99, 109, 100, 0, '2026-05-04 08:10:23.729171+00');
INSERT INTO public.stock_balances VALUES (100, 110, 120, 0, '2026-05-04 08:10:50.784588+00');
INSERT INTO public.stock_balances VALUES (101, 111, 300, 0, '2026-05-04 08:11:19.986047+00');
INSERT INTO public.stock_balances VALUES (102, 112, 200, 0, '2026-05-04 08:11:37.003966+00');
INSERT INTO public.stock_balances VALUES (103, 113, 100, 0, '2026-05-04 08:11:55.583152+00');
INSERT INTO public.stock_balances VALUES (104, 114, 0, 0, '2026-05-04 08:12:14.749483+00');
INSERT INTO public.stock_balances VALUES (105, 115, 60, 0, '2026-05-04 08:12:51.722606+00');
INSERT INTO public.stock_balances VALUES (106, 116, 110, 0, '2026-05-04 08:13:17.57779+00');
INSERT INTO public.stock_balances VALUES (107, 117, 0, 0, '2026-05-04 08:13:40.807338+00');
INSERT INTO public.stock_balances VALUES (108, 118, 0, 0, '2026-05-04 08:13:57.792372+00');
INSERT INTO public.stock_balances VALUES (109, 119, 10, 0, '2026-05-04 08:14:16.143148+00');
INSERT INTO public.stock_balances VALUES (110, 120, 220, 0, '2026-05-04 08:14:48.059689+00');
INSERT INTO public.stock_balances VALUES (111, 121, 100, 0, '2026-05-04 08:15:20.499584+00');
INSERT INTO public.stock_balances VALUES (112, 122, 200, 0, '2026-05-04 08:15:57.536119+00');
INSERT INTO public.stock_balances VALUES (113, 123, 200, 0, '2026-05-04 08:16:13.362734+00');
INSERT INTO public.stock_balances VALUES (114, 124, 40, 0, '2026-05-04 08:16:45.065712+00');
INSERT INTO public.stock_balances VALUES (115, 125, 20, 0, '2026-05-04 08:17:17.679033+00');
INSERT INTO public.stock_balances VALUES (117, 127, 7, 0, '2026-05-04 08:19:24.540547+00');
INSERT INTO public.stock_balances VALUES (118, 128, 1, 0, '2026-05-04 08:19:53.436856+00');
INSERT INTO public.stock_balances VALUES (15, 25, 190, 0, '2026-05-04 03:10:39.27062+00');
INSERT INTO public.stock_balances VALUES (16, 26, 50, 0, '2026-05-04 03:13:52.847185+00');
INSERT INTO public.stock_balances VALUES (18, 28, 7, 0, '2026-05-04 03:15:24.703541+00');
INSERT INTO public.stock_balances VALUES (19, 29, 2, 0, '2026-05-04 03:16:38.866336+00');
INSERT INTO public.stock_balances VALUES (20, 30, 1, 0, '2026-05-04 03:17:13.352039+00');
INSERT INTO public.stock_balances VALUES (21, 31, 12, 0, '2026-05-04 03:18:18.92347+00');
INSERT INTO public.stock_balances VALUES (23, 33, 3, 0, '2026-05-04 03:21:00.339422+00');
INSERT INTO public.stock_balances VALUES (24, 34, 17, 0, '2026-05-04 03:21:41.886819+00');
INSERT INTO public.stock_balances VALUES (25, 35, 12, 0, '2026-05-04 03:23:25.104+00');
INSERT INTO public.stock_balances VALUES (26, 36, 9, 0, '2026-05-04 03:24:37.895699+00');
INSERT INTO public.stock_balances VALUES (27, 37, 12, 0, '2026-05-04 03:25:25.110174+00');
INSERT INTO public.stock_balances VALUES (28, 38, 6, 0, '2026-05-04 03:25:56.214764+00');
INSERT INTO public.stock_balances VALUES (29, 39, 1, 0, '2026-05-04 03:26:59.642884+00');
INSERT INTO public.stock_balances VALUES (44, 54, 41, 0, '2026-05-07 02:31:50.891+00');
INSERT INTO public.stock_balances VALUES (31, 41, 9, 0, '2026-05-04 03:28:58.706154+00');
INSERT INTO public.stock_balances VALUES (32, 42, 8, 0, '2026-05-04 03:29:35.586475+00');
INSERT INTO public.stock_balances VALUES (33, 43, 9, 0, '2026-05-04 03:30:32.246231+00');
INSERT INTO public.stock_balances VALUES (34, 44, 167, 0, '2026-05-04 03:31:38.361889+00');
INSERT INTO public.stock_balances VALUES (35, 45, 96, 0, '2026-05-04 03:32:14.300237+00');
INSERT INTO public.stock_balances VALUES (36, 46, 1, 0, '2026-05-04 03:33:17.396939+00');
INSERT INTO public.stock_balances VALUES (14, 24, 24, 0, '2026-05-04 03:36:23.243+00');
INSERT INTO public.stock_balances VALUES (38, 48, 45, 0, '2026-05-04 03:37:50.639786+00');
INSERT INTO public.stock_balances VALUES (39, 49, 24, 0, '2026-05-04 03:38:55.741349+00');
INSERT INTO public.stock_balances VALUES (42, 52, 18, 0, '2026-05-04 03:41:17.287662+00');
INSERT INTO public.stock_balances VALUES (43, 53, 31, 0, '2026-05-04 03:42:41.973239+00');
INSERT INTO public.stock_balances VALUES (45, 55, 42, 0, '2026-05-04 05:17:01.779237+00');
INSERT INTO public.stock_balances VALUES (47, 57, 6, 0, '2026-05-04 05:18:59.493083+00');
INSERT INTO public.stock_balances VALUES (49, 59, 128, 0, '2026-05-04 05:21:55.64231+00');
INSERT INTO public.stock_balances VALUES (54, 64, 28, 0, '2026-05-04 05:29:13.720547+00');
INSERT INTO public.stock_balances VALUES (55, 65, 24, 0, '2026-05-04 05:30:19.954+00');
INSERT INTO public.stock_balances VALUES (56, 66, 12, 0, '2026-05-04 05:31:09.222814+00');
INSERT INTO public.stock_balances VALUES (57, 67, 35, 0, '2026-05-04 05:32:11.458182+00');
INSERT INTO public.stock_balances VALUES (58, 68, 13, 0, '2026-05-04 05:33:04.12063+00');
INSERT INTO public.stock_balances VALUES (60, 70, 7, 0, '2026-05-04 05:34:38.191108+00');
INSERT INTO public.stock_balances VALUES (62, 72, 1, 0, '2026-05-04 05:36:50.219872+00');
INSERT INTO public.stock_balances VALUES (64, 74, 12, 0, '2026-05-04 05:38:06.553696+00');
INSERT INTO public.stock_balances VALUES (66, 76, 6, 0, '2026-05-04 05:39:41.862329+00');
INSERT INTO public.stock_balances VALUES (67, 77, 1, 0, '2026-05-04 05:40:13.021888+00');
INSERT INTO public.stock_balances VALUES (69, 79, 12, 0, '2026-05-04 05:42:02.27282+00');
INSERT INTO public.stock_balances VALUES (70, 80, 6, 0, '2026-05-04 05:43:05.142557+00');
INSERT INTO public.stock_balances VALUES (71, 81, 20, 0, '2026-05-04 05:43:41.048947+00');
INSERT INTO public.stock_balances VALUES (72, 82, 6, 0, '2026-05-04 05:44:14.454967+00');
INSERT INTO public.stock_balances VALUES (73, 83, 50, 0, '2026-05-04 05:45:10.006446+00');
INSERT INTO public.stock_balances VALUES (74, 84, 5, 0, '2026-05-04 05:45:45.56089+00');
INSERT INTO public.stock_balances VALUES (76, 86, 4, 0, '2026-05-04 07:57:26.6766+00');
INSERT INTO public.stock_balances VALUES (77, 87, 3, 0, '2026-05-04 07:58:03.558658+00');
INSERT INTO public.stock_balances VALUES (78, 88, 2, 0, '2026-05-04 07:58:51.931475+00');
INSERT INTO public.stock_balances VALUES (79, 89, 2, 0, '2026-05-04 07:59:19.608916+00');
INSERT INTO public.stock_balances VALUES (80, 90, 200, 0, '2026-05-04 08:00:02.28531+00');
INSERT INTO public.stock_balances VALUES (82, 92, 700, 0, '2026-05-04 08:01:05.799268+00');
INSERT INTO public.stock_balances VALUES (83, 93, 300, 0, '2026-05-04 08:01:38.050183+00');
INSERT INTO public.stock_balances VALUES (84, 94, 400, 0, '2026-05-04 08:02:05.949925+00');
INSERT INTO public.stock_balances VALUES (85, 95, 470, 0, '2026-05-04 08:02:32.539497+00');
INSERT INTO public.stock_balances VALUES (86, 96, 100, 0, '2026-05-04 08:03:13.312499+00');
INSERT INTO public.stock_balances VALUES (88, 98, 300, 0, '2026-05-04 08:04:18.189692+00');
INSERT INTO public.stock_balances VALUES (89, 99, 160, 0, '2026-05-04 08:04:47.599598+00');
INSERT INTO public.stock_balances VALUES (90, 100, 270, 0, '2026-05-04 08:06:01.196646+00');
INSERT INTO public.stock_balances VALUES (91, 101, 90, 0, '2026-05-04 08:06:29.215583+00');
INSERT INTO public.stock_balances VALUES (92, 102, 220, 0, '2026-05-04 08:07:01.469576+00');
INSERT INTO public.stock_balances VALUES (93, 103, 400, 0, '2026-05-04 08:07:32.57087+00');
INSERT INTO public.stock_balances VALUES (95, 105, 80, 0, '2026-05-04 08:08:29.207733+00');
INSERT INTO public.stock_balances VALUES (96, 106, 520, 0, '2026-05-04 08:08:49.700077+00');
INSERT INTO public.stock_balances VALUES (97, 107, 300, 0, '2026-05-04 08:09:24.668218+00');
INSERT INTO public.stock_balances VALUES (121, 131, 23, 0, '2026-05-04 08:22:32.647461+00');
INSERT INTO public.stock_balances VALUES (123, 133, 1, 0, '2026-05-04 08:23:24.317467+00');
INSERT INTO public.stock_balances VALUES (124, 134, 12, 0, '2026-05-04 08:23:51.651607+00');
INSERT INTO public.stock_balances VALUES (126, 136, 87, 0, '2026-05-04 08:25:08.649358+00');
INSERT INTO public.stock_balances VALUES (127, 137, 5, 0, '2026-05-04 08:25:34.015003+00');
INSERT INTO public.stock_balances VALUES (128, 138, 52, 0, '2026-05-04 08:26:07.215875+00');
INSERT INTO public.stock_balances VALUES (129, 139, 4, 0, '2026-05-04 08:26:41.789023+00');
INSERT INTO public.stock_balances VALUES (130, 142, 7, 0, '2026-05-04 08:27:47.773032+00');
INSERT INTO public.stock_balances VALUES (131, 143, 3, 0, '2026-05-04 08:28:07.734979+00');
INSERT INTO public.stock_balances VALUES (132, 144, 3, 0, '2026-05-04 08:28:33.118562+00');
INSERT INTO public.stock_balances VALUES (133, 145, 5, 0, '2026-05-04 08:28:57.06963+00');
INSERT INTO public.stock_balances VALUES (134, 146, 2, 0, '2026-05-04 08:29:32.792735+00');
INSERT INTO public.stock_balances VALUES (135, 147, 0, 0, '2026-05-04 08:30:00.204267+00');
INSERT INTO public.stock_balances VALUES (136, 148, 2, 0, '2026-05-04 08:30:45.515479+00');
INSERT INTO public.stock_balances VALUES (137, 149, 7, 0, '2026-05-04 08:31:27.353454+00');
INSERT INTO public.stock_balances VALUES (138, 150, 1, 0, '2026-05-04 08:31:47.475602+00');
INSERT INTO public.stock_balances VALUES (139, 151, 0, 0, '2026-05-04 08:32:11.947309+00');
INSERT INTO public.stock_balances VALUES (140, 152, 5, 0, '2026-05-04 08:33:04.156352+00');
INSERT INTO public.stock_balances VALUES (141, 153, 53, 0, '2026-05-04 08:33:29.974321+00');
INSERT INTO public.stock_balances VALUES (142, 155, 39, 0, '2026-05-04 08:34:03.520771+00');
INSERT INTO public.stock_balances VALUES (143, 157, 1, 0, '2026-05-04 08:34:39.660568+00');
INSERT INTO public.stock_balances VALUES (144, 158, 72, 0, '2026-05-04 08:35:13.074257+00');
INSERT INTO public.stock_balances VALUES (145, 159, 2, 0, '2026-05-04 08:35:39.766707+00');
INSERT INTO public.stock_balances VALUES (120, 130, 20, 0, '2026-05-07 02:30:59.251+00');
INSERT INTO public.stock_balances VALUES (119, 129, 8, 0, '2026-05-07 02:27:35.291+00');
INSERT INTO public.stock_balances VALUES (37, 47, 13, 0, '2026-05-05 01:37:42.569+00');
INSERT INTO public.stock_balances VALUES (75, 85, 0, 0, '2026-05-05 01:38:21.505+00');
INSERT INTO public.stock_balances VALUES (116, 126, 7, 0, '2026-05-05 01:38:51.98+00');
INSERT INTO public.stock_balances VALUES (48, 58, 121, 0, '2026-05-05 01:40:46.622+00');
INSERT INTO public.stock_balances VALUES (87, 97, 500, 0, '2026-05-06 10:52:42.548+00');
INSERT INTO public.stock_balances VALUES (125, 135, 7, 0, '2026-05-05 01:42:25.935+00');
INSERT INTO public.stock_balances VALUES (52, 62, 110, 0, '2026-05-07 02:32:57.978+00');
INSERT INTO public.stock_balances VALUES (146, 160, 168, 0, '2026-05-05 06:52:50.450902+00');
INSERT INTO public.stock_balances VALUES (41, 51, 16, 0, '2026-05-06 01:46:52.803+00');
INSERT INTO public.stock_balances VALUES (51, 61, 27, 0, '2026-05-06 01:48:07.155+00');
INSERT INTO public.stock_balances VALUES (30, 40, 163, 0, '2026-05-06 01:48:37.595+00');
INSERT INTO public.stock_balances VALUES (63, 73, 1, 0, '2026-05-06 01:54:10.471+00');
INSERT INTO public.stock_balances VALUES (61, 71, 6, 0, '2026-05-06 01:56:33.894+00');
INSERT INTO public.stock_balances VALUES (59, 69, 13, 0, '2026-05-06 10:51:51.597+00');
INSERT INTO public.stock_balances VALUES (122, 132, 30, 0, '2026-05-07 02:31:29.624+00');
INSERT INTO public.stock_balances VALUES (94, 104, 200, 0, '2026-05-06 10:53:00.855+00');
INSERT INTO public.stock_balances VALUES (40, 50, 51, 0, '2026-05-07 02:23:56.348+00');
INSERT INTO public.stock_balances VALUES (46, 56, 0, 0, '2026-05-07 02:24:18.017+00');
INSERT INTO public.stock_balances VALUES (17, 27, 6, 0, '2026-05-07 02:24:44.993+00');
INSERT INTO public.stock_balances VALUES (22, 32, 87, 0, '2026-05-07 02:27:11.296+00');
INSERT INTO public.stock_balances VALUES (68, 78, 1, 0, '2026-05-07 02:28:14.169+00');
INSERT INTO public.stock_balances VALUES (65, 75, 3, 0, '2026-05-07 02:28:42.999+00');
INSERT INTO public.stock_balances VALUES (50, 60, 411, 0, '2026-05-07 02:29:55.792+00');
INSERT INTO public.stock_balances VALUES (53, 63, 380, 0, '2026-05-07 02:32:45.594+00');
INSERT INTO public.stock_balances VALUES (148, 162, 17, 0, '2026-05-05 06:53:46.395439+00');
INSERT INTO public.stock_balances VALUES (149, 163, 0, 0, '2026-05-05 06:58:25.467+00');
INSERT INTO public.stock_balances VALUES (147, 161, 46, 0, '2026-05-06 01:45:46.474+00');
INSERT INTO public.stock_balances VALUES (81, 91, 200, 0, '2026-05-06 01:57:45.589+00');


--
-- Data for Name: stock_issues; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stock_issue_items; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.stock_movements VALUES (32, 24, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-02 05:43:09.978246+00');
INSERT INTO public.stock_movements VALUES (35, 25, 'OPENING', 190, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:10:39.497251+00');
INSERT INTO public.stock_movements VALUES (36, 26, 'OPENING', 50, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:13:53.429963+00');
INSERT INTO public.stock_movements VALUES (37, 27, 'OPENING', 7, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:14:47.932158+00');
INSERT INTO public.stock_movements VALUES (38, 28, 'OPENING', 7, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:15:24.87665+00');
INSERT INTO public.stock_movements VALUES (39, 29, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:16:39.045454+00');
INSERT INTO public.stock_movements VALUES (40, 30, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:17:13.518995+00');
INSERT INTO public.stock_movements VALUES (41, 31, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:18:19.108936+00');
INSERT INTO public.stock_movements VALUES (42, 32, 'OPENING', 29, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:20:08.165822+00');
INSERT INTO public.stock_movements VALUES (43, 33, 'OPENING', 3, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:21:00.512169+00');
INSERT INTO public.stock_movements VALUES (44, 34, 'OPENING', 17, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:21:42.059716+00');
INSERT INTO public.stock_movements VALUES (45, 35, 'OPENING', 17, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:22:12.090504+00');
INSERT INTO public.stock_movements VALUES (46, 35, 'ADJUSTMENT_OUT', 5, NULL, NULL, NULL, 'វាយខុស', '2026-05-04 03:23:25.046671+00');
INSERT INTO public.stock_movements VALUES (47, 36, 'OPENING', 9, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:24:38.063061+00');
INSERT INTO public.stock_movements VALUES (48, 37, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:25:25.274696+00');
INSERT INTO public.stock_movements VALUES (49, 38, 'OPENING', 6, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:25:56.389048+00');
INSERT INTO public.stock_movements VALUES (50, 39, 'OPENING', 1, NULL, NULL, NULL, '1ប្រអប់', '2026-05-04 03:26:59.812771+00');
INSERT INTO public.stock_movements VALUES (51, 40, 'OPENING', 1, NULL, NULL, NULL, '1ប្រអប់', '2026-05-04 03:27:39.42097+00');
INSERT INTO public.stock_movements VALUES (52, 40, 'ADJUSTMENT_IN', 165, NULL, NULL, NULL, 'វាយខុស', '2026-05-04 03:28:19.72617+00');
INSERT INTO public.stock_movements VALUES (53, 41, 'OPENING', 9, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:28:58.873435+00');
INSERT INTO public.stock_movements VALUES (54, 42, 'OPENING', 8, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:29:35.751312+00');
INSERT INTO public.stock_movements VALUES (55, 43, 'OPENING', 9, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:30:32.422661+00');
INSERT INTO public.stock_movements VALUES (56, 44, 'OPENING', 167, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:31:38.528653+00');
INSERT INTO public.stock_movements VALUES (57, 45, 'OPENING', 96, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:32:14.466524+00');
INSERT INTO public.stock_movements VALUES (58, 46, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:33:17.5794+00');
INSERT INTO public.stock_movements VALUES (59, 47, 'OPENING', 14, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:35:53.236501+00');
INSERT INTO public.stock_movements VALUES (60, 24, 'ADJUSTMENT_IN', 12, NULL, NULL, NULL, 'old stock', '2026-05-04 03:36:23.194143+00');
INSERT INTO public.stock_movements VALUES (61, 48, 'OPENING', 45, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:37:50.811871+00');
INSERT INTO public.stock_movements VALUES (62, 49, 'OPENING', 24, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:38:55.918015+00');
INSERT INTO public.stock_movements VALUES (63, 50, 'OPENING', 53, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:39:35.201895+00');
INSERT INTO public.stock_movements VALUES (64, 51, 'OPENING', 17, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:40:33.628778+00');
INSERT INTO public.stock_movements VALUES (65, 52, 'OPENING', 18, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:41:17.479045+00');
INSERT INTO public.stock_movements VALUES (66, 53, 'OPENING', 31, NULL, NULL, NULL, 'Opening stock', '2026-05-04 03:42:42.148714+00');
INSERT INTO public.stock_movements VALUES (67, 54, 'OPENING', 44, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:16:26.206839+00');
INSERT INTO public.stock_movements VALUES (68, 55, 'OPENING', 42, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:17:01.951864+00');
INSERT INTO public.stock_movements VALUES (69, 56, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:18:11.432898+00');
INSERT INTO public.stock_movements VALUES (70, 57, 'OPENING', 6, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:18:59.659967+00');
INSERT INTO public.stock_movements VALUES (71, 58, 'OPENING', 122, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:20:57.699335+00');
INSERT INTO public.stock_movements VALUES (72, 59, 'OPENING', 128, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:21:55.817348+00');
INSERT INTO public.stock_movements VALUES (73, 60, 'OPENING', 413, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:23:03.861882+00');
INSERT INTO public.stock_movements VALUES (74, 61, 'OPENING', 29, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:24:40.206113+00');
INSERT INTO public.stock_movements VALUES (75, 62, 'OPENING', 114, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:25:31.247576+00');
INSERT INTO public.stock_movements VALUES (76, 63, 'OPENING', 387, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:28:26.94049+00');
INSERT INTO public.stock_movements VALUES (77, 64, 'OPENING', 28, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:29:13.89707+00');
INSERT INTO public.stock_movements VALUES (78, 65, 'OPENING', 23, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:30:03.24298+00');
INSERT INTO public.stock_movements VALUES (79, 65, 'ADJUSTMENT_IN', 1, NULL, NULL, NULL, 'វាយច្រលំ', '2026-05-04 05:30:19.918223+00');
INSERT INTO public.stock_movements VALUES (80, 66, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:31:09.387278+00');
INSERT INTO public.stock_movements VALUES (81, 67, 'OPENING', 35, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:32:11.631102+00');
INSERT INTO public.stock_movements VALUES (82, 68, 'OPENING', 13, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:33:04.293619+00');
INSERT INTO public.stock_movements VALUES (83, 69, 'OPENING', 3, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:33:57.707236+00');
INSERT INTO public.stock_movements VALUES (84, 70, 'OPENING', 7, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:34:38.356934+00');
INSERT INTO public.stock_movements VALUES (85, 71, 'OPENING', 7, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:35:31.461184+00');
INSERT INTO public.stock_movements VALUES (86, 72, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:36:50.387083+00');
INSERT INTO public.stock_movements VALUES (87, 73, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:37:30.719535+00');
INSERT INTO public.stock_movements VALUES (88, 74, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:38:06.722875+00');
INSERT INTO public.stock_movements VALUES (89, 75, 'OPENING', 4, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:39:10.447026+00');
INSERT INTO public.stock_movements VALUES (90, 76, 'OPENING', 6, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:39:42.044313+00');
INSERT INTO public.stock_movements VALUES (91, 77, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:40:13.20166+00');
INSERT INTO public.stock_movements VALUES (92, 78, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:41:17.663263+00');
INSERT INTO public.stock_movements VALUES (93, 79, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:42:02.443182+00');
INSERT INTO public.stock_movements VALUES (94, 80, 'OPENING', 6, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:43:05.314705+00');
INSERT INTO public.stock_movements VALUES (95, 81, 'OPENING', 20, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:43:41.222432+00');
INSERT INTO public.stock_movements VALUES (96, 82, 'OPENING', 6, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:44:14.631936+00');
INSERT INTO public.stock_movements VALUES (97, 83, 'OPENING', 50, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:45:10.175901+00');
INSERT INTO public.stock_movements VALUES (98, 84, 'OPENING', 5, NULL, NULL, NULL, 'Opening stock', '2026-05-04 05:45:45.728892+00');
INSERT INTO public.stock_movements VALUES (99, 85, 'OPENING', 4, NULL, NULL, NULL, 'Opening stock', '2026-05-04 07:56:51.783747+00');
INSERT INTO public.stock_movements VALUES (100, 86, 'OPENING', 4, NULL, NULL, NULL, 'Opening stock', '2026-05-04 07:57:26.84825+00');
INSERT INTO public.stock_movements VALUES (101, 87, 'OPENING', 3, NULL, NULL, NULL, 'Opening stock', '2026-05-04 07:58:03.741185+00');
INSERT INTO public.stock_movements VALUES (102, 88, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 07:58:52.097562+00');
INSERT INTO public.stock_movements VALUES (103, 89, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 07:59:19.789481+00');
INSERT INTO public.stock_movements VALUES (104, 90, 'OPENING', 200, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:00:02.458003+00');
INSERT INTO public.stock_movements VALUES (105, 91, 'OPENING', 300, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:00:34.061924+00');
INSERT INTO public.stock_movements VALUES (106, 92, 'OPENING', 700, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:01:05.979531+00');
INSERT INTO public.stock_movements VALUES (107, 93, 'OPENING', 300, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:01:38.632039+00');
INSERT INTO public.stock_movements VALUES (108, 94, 'OPENING', 400, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:02:06.121784+00');
INSERT INTO public.stock_movements VALUES (109, 95, 'OPENING', 470, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:02:32.702492+00');
INSERT INTO public.stock_movements VALUES (110, 96, 'OPENING', 100, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:03:13.476038+00');
INSERT INTO public.stock_movements VALUES (111, 97, 'OPENING', 200, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:03:44.464221+00');
INSERT INTO public.stock_movements VALUES (112, 98, 'OPENING', 300, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:04:18.375782+00');
INSERT INTO public.stock_movements VALUES (113, 99, 'OPENING', 160, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:04:47.768971+00');
INSERT INTO public.stock_movements VALUES (114, 100, 'OPENING', 270, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:06:01.366053+00');
INSERT INTO public.stock_movements VALUES (115, 101, 'OPENING', 90, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:06:29.377257+00');
INSERT INTO public.stock_movements VALUES (116, 102, 'OPENING', 220, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:07:01.640236+00');
INSERT INTO public.stock_movements VALUES (117, 103, 'OPENING', 400, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:07:32.745787+00');
INSERT INTO public.stock_movements VALUES (118, 105, 'OPENING', 80, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:08:29.372742+00');
INSERT INTO public.stock_movements VALUES (119, 106, 'OPENING', 520, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:08:49.864497+00');
INSERT INTO public.stock_movements VALUES (120, 107, 'OPENING', 300, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:09:24.863943+00');
INSERT INTO public.stock_movements VALUES (121, 108, 'OPENING', 400, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:09:58.686816+00');
INSERT INTO public.stock_movements VALUES (122, 109, 'OPENING', 100, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:10:23.901263+00');
INSERT INTO public.stock_movements VALUES (123, 110, 'OPENING', 120, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:10:50.956888+00');
INSERT INTO public.stock_movements VALUES (124, 111, 'OPENING', 300, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:11:20.150151+00');
INSERT INTO public.stock_movements VALUES (125, 112, 'OPENING', 200, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:11:37.173824+00');
INSERT INTO public.stock_movements VALUES (126, 113, 'OPENING', 100, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:11:55.747699+00');
INSERT INTO public.stock_movements VALUES (127, 115, 'OPENING', 60, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:12:51.897305+00');
INSERT INTO public.stock_movements VALUES (128, 116, 'OPENING', 110, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:13:17.745168+00');
INSERT INTO public.stock_movements VALUES (129, 119, 'OPENING', 10, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:14:16.304618+00');
INSERT INTO public.stock_movements VALUES (130, 120, 'OPENING', 220, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:14:48.224152+00');
INSERT INTO public.stock_movements VALUES (131, 121, 'OPENING', 100, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:15:20.665761+00');
INSERT INTO public.stock_movements VALUES (132, 122, 'OPENING', 200, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:15:57.701085+00');
INSERT INTO public.stock_movements VALUES (133, 123, 'OPENING', 200, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:16:13.537453+00');
INSERT INTO public.stock_movements VALUES (134, 124, 'OPENING', 40, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:16:45.232601+00');
INSERT INTO public.stock_movements VALUES (135, 125, 'OPENING', 20, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:17:17.850699+00');
INSERT INTO public.stock_movements VALUES (136, 126, 'OPENING', 8, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:18:12.511335+00');
INSERT INTO public.stock_movements VALUES (137, 127, 'OPENING', 7, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:19:24.72732+00');
INSERT INTO public.stock_movements VALUES (138, 128, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:19:53.607485+00');
INSERT INTO public.stock_movements VALUES (139, 129, 'OPENING', 10, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:20:31.454776+00');
INSERT INTO public.stock_movements VALUES (140, 130, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:22:04.924308+00');
INSERT INTO public.stock_movements VALUES (141, 131, 'OPENING', 23, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:22:32.812593+00');
INSERT INTO public.stock_movements VALUES (142, 132, 'OPENING', 32, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:22:59.28281+00');
INSERT INTO public.stock_movements VALUES (143, 133, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:23:24.489872+00');
INSERT INTO public.stock_movements VALUES (144, 134, 'OPENING', 12, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:23:51.81948+00');
INSERT INTO public.stock_movements VALUES (145, 135, 'OPENING', 10, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:24:14.501473+00');
INSERT INTO public.stock_movements VALUES (146, 136, 'OPENING', 87, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:25:08.824422+00');
INSERT INTO public.stock_movements VALUES (147, 137, 'OPENING', 5, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:25:34.182783+00');
INSERT INTO public.stock_movements VALUES (148, 138, 'OPENING', 52, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:26:07.383103+00');
INSERT INTO public.stock_movements VALUES (149, 139, 'OPENING', 4, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:26:41.952115+00');
INSERT INTO public.stock_movements VALUES (150, 142, 'OPENING', 7, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:27:47.942629+00');
INSERT INTO public.stock_movements VALUES (151, 143, 'OPENING', 3, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:28:07.902109+00');
INSERT INTO public.stock_movements VALUES (152, 144, 'OPENING', 3, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:28:33.283645+00');
INSERT INTO public.stock_movements VALUES (153, 145, 'OPENING', 5, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:28:57.232347+00');
INSERT INTO public.stock_movements VALUES (154, 146, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:29:32.962677+00');
INSERT INTO public.stock_movements VALUES (155, 148, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:30:45.676464+00');
INSERT INTO public.stock_movements VALUES (156, 149, 'OPENING', 7, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:31:27.523184+00');
INSERT INTO public.stock_movements VALUES (157, 150, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:31:47.655185+00');
INSERT INTO public.stock_movements VALUES (158, 152, 'OPENING', 5, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:33:04.336677+00');
INSERT INTO public.stock_movements VALUES (159, 153, 'OPENING', 53, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:33:30.146566+00');
INSERT INTO public.stock_movements VALUES (160, 155, 'OPENING', 39, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:34:03.696764+00');
INSERT INTO public.stock_movements VALUES (161, 157, 'OPENING', 1, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:34:39.830746+00');
INSERT INTO public.stock_movements VALUES (162, 158, 'OPENING', 72, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:35:13.244529+00');
INSERT INTO public.stock_movements VALUES (163, 159, 'OPENING', 2, NULL, NULL, NULL, 'Opening stock', '2026-05-04 08:35:39.93357+00');
INSERT INTO public.stock_movements VALUES (164, 63, 'ADJUSTMENT_OUT', 3, NULL, NULL, NULL, '02-05-2026', '2026-05-04 08:39:47.005036+00');
INSERT INTO public.stock_movements VALUES (165, 62, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '02-05-2026', '2026-05-04 08:40:08.508676+00');
INSERT INTO public.stock_movements VALUES (166, 47, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '04-05-2026', '2026-05-05 01:37:42.468226+00');
INSERT INTO public.stock_movements VALUES (167, 85, 'ADJUSTMENT_OUT', 4, NULL, NULL, NULL, '04-05-2026', '2026-05-05 01:38:21.440453+00');
INSERT INTO public.stock_movements VALUES (168, 126, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '04-05-2026', '2026-05-05 01:38:51.916152+00');
INSERT INTO public.stock_movements VALUES (169, 58, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '04-05-2026', '2026-05-05 01:40:46.545992+00');
INSERT INTO public.stock_movements VALUES (170, 130, 'ADJUSTMENT_OUT', 2, NULL, NULL, NULL, '04-05-2026', '2026-05-05 01:41:35.145978+00');
INSERT INTO public.stock_movements VALUES (171, 135, 'ADJUSTMENT_OUT', 3, NULL, NULL, NULL, '04-05-2026', '2026-05-05 01:42:25.868475+00');
INSERT INTO public.stock_movements VALUES (172, 60, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '04-05-2026', '2026-05-05 01:42:56.461473+00');
INSERT INTO public.stock_movements VALUES (173, 160, 'OPENING', 168, NULL, NULL, NULL, 'Opening stock', '2026-05-05 06:52:50.800157+00');
INSERT INTO public.stock_movements VALUES (174, 161, 'OPENING', 47, NULL, NULL, NULL, 'Opening stock', '2026-05-05 06:53:17.322164+00');
INSERT INTO public.stock_movements VALUES (175, 162, 'OPENING', 17, NULL, NULL, NULL, 'Opening stock', '2026-05-05 06:53:46.635633+00');
INSERT INTO public.stock_movements VALUES (176, 163, 'OPENING', 5, NULL, NULL, NULL, 'Opening stock', '2026-05-05 06:54:35.115882+00');
INSERT INTO public.stock_movements VALUES (177, 163, 'LOAN_OUT', 5, 9, NULL, NULL, 'ខ្ចីA5(St3153-701)', '2026-05-05 06:58:25.430336+00');
INSERT INTO public.stock_movements VALUES (178, 161, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, 'A2', '2026-05-06 01:45:46.357874+00');
INSERT INTO public.stock_movements VALUES (179, 51, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, 'A6', '2026-05-06 01:46:52.721617+00');
INSERT INTO public.stock_movements VALUES (180, 61, 'ADJUSTMENT_OUT', 2, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:48:07.066413+00');
INSERT INTO public.stock_movements VALUES (181, 40, 'ADJUSTMENT_OUT', 3, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:48:37.512512+00');
INSERT INTO public.stock_movements VALUES (182, 132, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:49:39.016845+00');
INSERT INTO public.stock_movements VALUES (183, 130, 'ADJUSTMENT_OUT', 3, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:51:46.200538+00');
INSERT INTO public.stock_movements VALUES (184, 130, 'ADJUSTMENT_OUT', 4, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:53:30.560963+00');
INSERT INTO public.stock_movements VALUES (185, 73, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:54:10.392157+00');
INSERT INTO public.stock_movements VALUES (186, 71, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:56:33.809226+00');
INSERT INTO public.stock_movements VALUES (187, 62, 'ADJUSTMENT_OUT', 2, NULL, NULL, NULL, 'Stock', '2026-05-06 01:57:13.055182+00');
INSERT INTO public.stock_movements VALUES (188, 91, 'ADJUSTMENT_OUT', 100, NULL, NULL, NULL, '05-05-2026', '2026-05-06 01:57:45.505366+00');
INSERT INTO public.stock_movements VALUES (189, 32, 'ADJUSTMENT_IN', 60, NULL, NULL, NULL, '06-05-2026', '2026-05-06 10:51:19.545636+00');
INSERT INTO public.stock_movements VALUES (190, 69, 'ADJUSTMENT_IN', 10, NULL, NULL, NULL, '06-05-2026', '2026-05-06 10:51:51.640626+00');
INSERT INTO public.stock_movements VALUES (191, 130, 'ADJUSTMENT_IN', 20, NULL, NULL, NULL, '06-05-2026', '2026-05-06 10:52:13.344866+00');
INSERT INTO public.stock_movements VALUES (192, 97, 'ADJUSTMENT_IN', 300, NULL, NULL, NULL, '06-05-2026', '2026-05-06 10:52:42.600034+00');
INSERT INTO public.stock_movements VALUES (193, 104, 'ADJUSTMENT_IN', 200, NULL, NULL, NULL, '06-05-2026', '2026-05-06 10:53:00.905129+00');
INSERT INTO public.stock_movements VALUES (194, 50, 'ADJUSTMENT_OUT', 2, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:23:56.233293+00');
INSERT INTO public.stock_movements VALUES (195, 56, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:24:17.96016+00');
INSERT INTO public.stock_movements VALUES (196, 27, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:24:44.937177+00');
INSERT INTO public.stock_movements VALUES (197, 32, 'ADJUSTMENT_OUT', 2, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:27:11.237082+00');
INSERT INTO public.stock_movements VALUES (198, 129, 'ADJUSTMENT_OUT', 2, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:27:35.221112+00');
INSERT INTO public.stock_movements VALUES (199, 78, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:28:14.110112+00');
INSERT INTO public.stock_movements VALUES (200, 75, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:28:42.939979+00');
INSERT INTO public.stock_movements VALUES (201, 54, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:29:04.869488+00');
INSERT INTO public.stock_movements VALUES (202, 54, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:29:30.751597+00');
INSERT INTO public.stock_movements VALUES (203, 60, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:29:55.733287+00');
INSERT INTO public.stock_movements VALUES (204, 63, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:30:23.064212+00');
INSERT INTO public.stock_movements VALUES (205, 130, 'ADJUSTMENT_OUT', 3, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:30:59.195738+00');
INSERT INTO public.stock_movements VALUES (206, 132, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:31:29.563738+00');
INSERT INTO public.stock_movements VALUES (207, 54, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:31:50.833257+00');
INSERT INTO public.stock_movements VALUES (208, 63, 'ADJUSTMENT_OUT', 3, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:32:45.523608+00');
INSERT INTO public.stock_movements VALUES (209, 62, 'ADJUSTMENT_OUT', 1, NULL, NULL, NULL, '06-05-2026', '2026-05-07 02:32:57.889169+00');


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

INSERT INTO realtime.schema_migrations VALUES (20211116024918, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211116045059, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211116050929, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211116051442, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211116212300, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211116213355, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211116213934, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211116214523, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211122062447, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211124070109, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211202204204, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211202204605, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211210212804, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20211228014915, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20220107221237, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20220228202821, '2026-04-17 05:56:14');
INSERT INTO realtime.schema_migrations VALUES (20220312004840, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20220603231003, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20220603232444, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20220615214548, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20220712093339, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20220908172859, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20220916233421, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20230119133233, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20230128025114, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20230128025212, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20230227211149, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20230228184745, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20230308225145, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20230328144023, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20231018144023, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20231204144023, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20231204144024, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20231204144025, '2026-04-17 05:56:15');
INSERT INTO realtime.schema_migrations VALUES (20240108234812, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240109165339, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240227174441, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240311171622, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240321100241, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240401105812, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240418121054, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240523004032, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240618124746, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240801235015, '2026-04-17 08:26:59');
INSERT INTO realtime.schema_migrations VALUES (20240805133720, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20240827160934, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20240919163303, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20240919163305, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241019105805, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241030150047, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241108114728, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241121104152, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241130184212, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241220035512, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241220123912, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20241224161212, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250107150512, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250110162412, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250123174212, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250128220012, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250506224012, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250523164012, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250714121412, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20250905041441, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20251103001201, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20251120212548, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20251120215549, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20260218120000, '2026-04-17 08:27:00');
INSERT INTO realtime.schema_migrations VALUES (20260326120000, '2026-04-17 08:27:00');


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.buckets VALUES ('product-images', 'product-images', NULL, '2026-05-07 04:48:55.500273+00', '2026-05-07 04:48:55.500273+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.migrations VALUES (0, 'create-migrations-table', 'e18db593bcde2aca2a408c4d1100f6abba2195df', '2026-04-17 05:56:40.02628');
INSERT INTO storage.migrations VALUES (1, 'initialmigration', '6ab16121fbaa08bbd11b712d05f358f9b555d777', '2026-04-17 05:56:40.067213');
INSERT INTO storage.migrations VALUES (2, 'storage-schema', 'f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd', '2026-04-17 05:56:40.069098');
INSERT INTO storage.migrations VALUES (3, 'pathtoken-column', '2cb1b0004b817b29d5b0a971af16bafeede4b70d', '2026-04-17 05:56:40.092348');
INSERT INTO storage.migrations VALUES (4, 'add-migrations-rls', '427c5b63fe1c5937495d9c635c263ee7a5905058', '2026-04-17 05:56:40.102532');
INSERT INTO storage.migrations VALUES (5, 'add-size-functions', '79e081a1455b63666c1294a440f8ad4b1e6a7f84', '2026-04-17 05:56:40.104497');
INSERT INTO storage.migrations VALUES (6, 'change-column-name-in-get-size', 'ded78e2f1b5d7e616117897e6443a925965b30d2', '2026-04-17 05:56:40.107534');
INSERT INTO storage.migrations VALUES (7, 'add-rls-to-buckets', 'e7e7f86adbc51049f341dfe8d30256c1abca17aa', '2026-04-17 05:56:40.111');
INSERT INTO storage.migrations VALUES (8, 'add-public-to-buckets', 'fd670db39ed65f9d08b01db09d6202503ca2bab3', '2026-04-17 05:56:40.113377');
INSERT INTO storage.migrations VALUES (9, 'fix-search-function', 'af597a1b590c70519b464a4ab3be54490712796b', '2026-04-17 05:56:40.115641');
INSERT INTO storage.migrations VALUES (10, 'search-files-search-function', 'b595f05e92f7e91211af1bbfe9c6a13bb3391e16', '2026-04-17 05:56:40.117967');
INSERT INTO storage.migrations VALUES (11, 'add-trigger-to-auto-update-updated_at-column', '7425bdb14366d1739fa8a18c83100636d74dcaa2', '2026-04-17 05:56:40.120563');
INSERT INTO storage.migrations VALUES (12, 'add-automatic-avif-detection-flag', '8e92e1266eb29518b6a4c5313ab8f29dd0d08df9', '2026-04-17 05:56:40.122979');
INSERT INTO storage.migrations VALUES (13, 'add-bucket-custom-limits', 'cce962054138135cd9a8c4bcd531598684b25e7d', '2026-04-17 05:56:40.124972');
INSERT INTO storage.migrations VALUES (14, 'use-bytes-for-max-size', '941c41b346f9802b411f06f30e972ad4744dad27', '2026-04-17 05:56:40.127248');
INSERT INTO storage.migrations VALUES (15, 'add-can-insert-object-function', '934146bc38ead475f4ef4b555c524ee5d66799e5', '2026-04-17 05:56:40.150005');
INSERT INTO storage.migrations VALUES (16, 'add-version', '76debf38d3fd07dcfc747ca49096457d95b1221b', '2026-04-17 05:56:40.152321');
INSERT INTO storage.migrations VALUES (17, 'drop-owner-foreign-key', 'f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101', '2026-04-17 05:56:40.154342');
INSERT INTO storage.migrations VALUES (18, 'add_owner_id_column_deprecate_owner', 'e7a511b379110b08e2f214be852c35414749fe66', '2026-04-17 05:56:40.156493');
INSERT INTO storage.migrations VALUES (19, 'alter-default-value-objects-id', '02e5e22a78626187e00d173dc45f58fa66a4f043', '2026-04-17 05:56:40.160115');
INSERT INTO storage.migrations VALUES (20, 'list-objects-with-delimiter', 'cd694ae708e51ba82bf012bba00caf4f3b6393b7', '2026-04-17 05:56:40.162083');
INSERT INTO storage.migrations VALUES (21, 's3-multipart-uploads', '8c804d4a566c40cd1e4cc5b3725a664a9303657f', '2026-04-17 05:56:40.16589');
INSERT INTO storage.migrations VALUES (22, 's3-multipart-uploads-big-ints', '9737dc258d2397953c9953d9b86920b8be0cdb73', '2026-04-17 05:56:40.177989');
INSERT INTO storage.migrations VALUES (23, 'optimize-search-function', '9d7e604cddc4b56a5422dc68c9313f4a1b6f132c', '2026-04-17 05:56:40.186232');
INSERT INTO storage.migrations VALUES (24, 'operation-function', '8312e37c2bf9e76bbe841aa5fda889206d2bf8aa', '2026-04-17 05:56:40.18904');
INSERT INTO storage.migrations VALUES (25, 'custom-metadata', 'd974c6057c3db1c1f847afa0e291e6165693b990', '2026-04-17 05:56:40.191106');
INSERT INTO storage.migrations VALUES (26, 'objects-prefixes', '215cabcb7f78121892a5a2037a09fedf9a1ae322', '2026-04-17 05:56:40.194362');
INSERT INTO storage.migrations VALUES (27, 'search-v2', '859ba38092ac96eb3964d83bf53ccc0b141663a6', '2026-04-17 05:56:40.196154');
INSERT INTO storage.migrations VALUES (28, 'object-bucket-name-sorting', 'c73a2b5b5d4041e39705814fd3a1b95502d38ce4', '2026-04-17 05:56:40.197811');
INSERT INTO storage.migrations VALUES (29, 'create-prefixes', 'ad2c1207f76703d11a9f9007f821620017a66c21', '2026-04-17 05:56:40.199392');
INSERT INTO storage.migrations VALUES (30, 'update-object-levels', '2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6', '2026-04-17 05:56:40.20092');
INSERT INTO storage.migrations VALUES (31, 'objects-level-index', 'b40367c14c3440ec75f19bbce2d71e914ddd3da0', '2026-04-17 05:56:40.202486');
INSERT INTO storage.migrations VALUES (32, 'backward-compatible-index-on-objects', 'e0c37182b0f7aee3efd823298fb3c76f1042c0f7', '2026-04-17 05:56:40.204027');
INSERT INTO storage.migrations VALUES (33, 'backward-compatible-index-on-prefixes', 'b480e99ed951e0900f033ec4eb34b5bdcb4e3d49', '2026-04-17 05:56:40.205578');
INSERT INTO storage.migrations VALUES (34, 'optimize-search-function-v1', 'ca80a3dc7bfef894df17108785ce29a7fc8ee456', '2026-04-17 05:56:40.207147');
INSERT INTO storage.migrations VALUES (35, 'add-insert-trigger-prefixes', '458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc', '2026-04-17 05:56:40.208599');
INSERT INTO storage.migrations VALUES (36, 'optimise-existing-functions', '6ae5fca6af5c55abe95369cd4f93985d1814ca8f', '2026-04-17 05:56:40.210121');
INSERT INTO storage.migrations VALUES (37, 'add-bucket-name-length-trigger', '3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1', '2026-04-17 05:56:40.211592');
INSERT INTO storage.migrations VALUES (38, 'iceberg-catalog-flag-on-buckets', '02716b81ceec9705aed84aa1501657095b32e5c5', '2026-04-17 05:56:40.214184');
INSERT INTO storage.migrations VALUES (39, 'add-search-v2-sort-support', '6706c5f2928846abee18461279799ad12b279b78', '2026-04-17 05:56:40.222431');
INSERT INTO storage.migrations VALUES (40, 'fix-prefix-race-conditions-optimized', '7ad69982ae2d372b21f48fc4829ae9752c518f6b', '2026-04-17 05:56:40.223959');
INSERT INTO storage.migrations VALUES (41, 'add-object-level-update-trigger', '07fcf1a22165849b7a029deed059ffcde08d1ae0', '2026-04-17 05:56:40.225538');
INSERT INTO storage.migrations VALUES (42, 'rollback-prefix-triggers', '771479077764adc09e2ea2043eb627503c034cd4', '2026-04-17 05:56:40.226993');
INSERT INTO storage.migrations VALUES (43, 'fix-object-level', '84b35d6caca9d937478ad8a797491f38b8c2979f', '2026-04-17 05:56:40.228881');
INSERT INTO storage.migrations VALUES (44, 'vector-bucket-type', '99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3', '2026-04-17 05:56:40.230415');
INSERT INTO storage.migrations VALUES (45, 'vector-buckets', '049e27196d77a7cb76497a85afae669d8b230953', '2026-04-17 05:56:40.232891');
INSERT INTO storage.migrations VALUES (46, 'buckets-objects-grants', 'fedeb96d60fefd8e02ab3ded9fbde05632f84aed', '2026-04-17 05:56:40.240943');
INSERT INTO storage.migrations VALUES (47, 'iceberg-table-metadata', '649df56855c24d8b36dd4cc1aeb8251aa9ad42c2', '2026-04-17 05:56:40.243446');
INSERT INTO storage.migrations VALUES (48, 'iceberg-catalog-ids', 'e0e8b460c609b9999ccd0df9ad14294613eed939', '2026-04-17 05:56:40.245291');
INSERT INTO storage.migrations VALUES (49, 'buckets-objects-grants-postgres', '072b1195d0d5a2f888af6b2302a1938dd94b8b3d', '2026-04-17 05:56:40.25988');
INSERT INTO storage.migrations VALUES (50, 'search-v2-optimised', '6323ac4f850aa14e7387eb32102869578b5bd478', '2026-04-17 05:56:40.262987');
INSERT INTO storage.migrations VALUES (51, 'index-backward-compatible-search', '2ee395d433f76e38bcd3856debaf6e0e5b674011', '2026-04-17 05:56:41.144084');
INSERT INTO storage.migrations VALUES (52, 'drop-not-used-indexes-and-functions', '5cc44c8696749ac11dd0dc37f2a3802075f3a171', '2026-04-17 05:56:41.145133');
INSERT INTO storage.migrations VALUES (53, 'drop-index-lower-name', 'd0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854', '2026-04-17 05:56:41.153421');
INSERT INTO storage.migrations VALUES (54, 'drop-index-object-level', '6289e048b1472da17c31a7eba1ded625a6457e67', '2026-04-17 05:56:41.154901');
INSERT INTO storage.migrations VALUES (55, 'prevent-direct-deletes', '262a4798d5e0f2e7c8970232e03ce8be695d5819', '2026-04-17 05:56:41.155731');
INSERT INTO storage.migrations VALUES (57, 's3-multipart-uploads-metadata', 'f127886e00d1b374fadbc7c6b31e09336aad5287', '2026-04-17 05:56:41.163026');
INSERT INTO storage.migrations VALUES (58, 'operation-ergonomics', '00ca5d483b3fe0d522133d9002ccc5df98365120', '2026-04-17 05:56:41.164993');
INSERT INTO storage.migrations VALUES (56, 'fix-optimized-search-function', 'b823ed1e418101032fa01374edc9a436e54e3ed4', '2026-04-17 05:56:41.158847');
INSERT INTO storage.migrations VALUES (59, 'drop-unused-functions', '38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4', '2026-05-07 04:47:42.134895');
INSERT INTO storage.migrations VALUES (60, 'optimize-existing-functions-again', 'db35e1c91a9201e59f4fef8d972c2f277d68b157', '2026-05-07 04:47:42.146361');


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.objects VALUES ('482005a6-10d2-4b4f-bae1-da41a07e5404', 'product-images', 'products/68/1778131946572.jpg', NULL, '2026-05-07 05:32:18.161363+00', '2026-05-07 05:32:18.161363+00', '2026-05-07 05:32:18.161363+00', '{"eTag": "\"68472c69b14fc349435effae3052b55a\"", "size": 2977, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-05-07T05:32:19.000Z", "contentLength": 2977, "httpStatusCode": 200}', DEFAULT, 'b2dcf0b5-4848-4ef6-9a19-81abfc7a55ae', NULL, '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 15, true);


--
-- Name: loan_items_loan_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loan_items_loan_item_id_seq', 9, true);


--
-- Name: loans_loan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.loans_loan_id_seq', 9, true);


--
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 163, true);


--
-- Name: sale_items_sale_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_sale_item_id_seq', 1, false);


--
-- Name: sales_sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_sale_id_seq', 1, false);


--
-- Name: stock_balances_stock_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_balances_stock_balance_id_seq', 149, true);


--
-- Name: stock_issue_items_stock_issue_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_issue_items_stock_issue_item_id_seq', 1, false);


--
-- Name: stock_issues_stock_issue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_issues_stock_issue_id_seq', 1, false);


--
-- Name: stock_movements_movement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_movement_id_seq', 209, true);


--
-- Name: workers_worker_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workers_worker_id_seq', 11, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict yJgd7Fc16XeJUjpItQBLbYrdVOkPQyx1bKsuJ8mgo44fG2DEaNAt2yiTt1Hz3PB

